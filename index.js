"use strict";

const game = {
  title: "Animals Baseball League",
  preventClicks: false,
  isRunning: false,
  currentScreen: null,
  numOfPairs: 3, // init null
  matchedPairs: 0,
  strikes: 0,
  level: 1,
  totalLevel: 6,

  // Arrays for game
  drawnCards: [],
  cardPairs: [],
  flipedCards: [],

  // Timer methods values
  loopDuration: 10,
  totalTime: 10000000, //init 10000
  timeRemaining: 10000000,
  animFrameID: null,
  startTS: null,

  // DOM
  $min: $(".game-board__minutes"),
  $sec: $(".game-board__seconds"),
  $tenthsSec: $(".game-board__tenths-seconds"),

  // Player
  player: {
    score: 0,

    updateScore() {
      this.score += 1;
      $(".score").text(this.score);
    },

    resetScore() {
      this.score = 0;
      $(".score").text(this.score);
    },
  },

  switchScreen(screen = "splash") {
    this.currentScreen = screen;
    $(".screen").hide();
    $(`#${screen}`).show();
  },

  /* ==== Game functions ====*/

  init() {
    $(".game-title").text(game.title);
    game.levelTagAnimate();

    // $(".mode-btn").on("click", (e) => {
    //   if ($(e.target).data("mode") === "easy") {
    //     game.totalLevel = 6;
    //   } else if ($(e.target).data("mode") === "medium") {
    //     game.totalLevel = 9;
    //   } else if ($(e.target).data("mode") === "hard") {
    //     game.totalLevel = 12;
    //   }
    // });
    $(".btn-check").on("click", (e) => {
      if ($(".btn-check:checked").data("mode") === "easy") {
        game.totalLevel = 6;
      } else if ($(".btn-check:checked").data("mode") === "medium") {
        game.totalLevel = 9;
      } else if ($(".btn-check:checked").data("mode") === "hard") {
        game.totalLevel = 12;
      }
    });

    $(".start-btn").on("click", () => {
      game.switchScreen("game");
      game.dealCards();
      game.updateClock();
    });
  },

  playSound(scene) {
    let audio = new Audio("sounds/" + scene + ".mp3");
    audio.play();
  },

  levelTagAnimate() {
    $(".game-board__list-wrapper p")
      .animate({ top: "+=10px" }, 1000)
      .animate({ top: "-=10px" }, 1000, game.levelTagAnimate);
  },

  dealCards() {
    game.resetGameboard();
    game.resetCards();
    game.drawCards();
    game.pairCards();
    game.shuffleCards();
    game.displayCards();
    game.selectCard();
  },

  updateGridTemplate(numOfPairs) {
    setTimeout(function () {
      $(".game-board__list").css(
        "grid-template-columns",
        `repeat(${numOfPairs}, 1fr)`
      );
    }, 400);
  },

  handleLevelUpLayout() {
    game.level++;

    switch (game.level) {
      case 1:
      case 2:
      case 3:
        game.numOfPairs = 3;
        game.totalTime = 10000 + 100000;
        game.updateGridTemplate(game.numOfPairs);
        break;
      case 4:
      case 5:
      case 6:
        game.numOfPairs = 4;
        game.totalTime = 13000 + 100000;
        game.updateGridTemplate(game.numOfPairs);
        break;
      case 7:
      case 8:
      case 9:
        game.numOfPairs = 6;
        game.totalTime = 20000 + 100000;
        game.updateGridTemplate(game.numOfPairs - 2);
        break;
      case 10:
      case 11:
        game.numOfPairs = 8;
        game.totalTime = 25000 + 100000;
        game.updateGridTemplate(game.numOfPairs - 4);
        break;
      case 12:
        game.numOfPairs = 10;
        game.totalTime = 35000 + 100000;
        game.updateGridTemplate(game.numOfPairs - 5);
        break;
    }
  },

  /* Clear the DOM for a new round */
  resetGameboard() {
    $(".game-board__list").html("");
  },

  /* Reset the card Arrays to empty  */
  resetCards() {
    game.drawnCards = [];
    game.cardPairs = [];
    game.matchedPairs = 0;
  },

  drawCards() {
    for (let i = 1; i <= game.numOfPairs; i++) {
      let randomNum = Math.floor(Math.random() * 12 + 1);
      // Draw numOfPairs numbers and push into drawnCards, if drawnCards array has same num, re random a number
      while (game.drawnCards.includes(randomNum)) {
        randomNum = Math.floor(Math.random() * 12 + 1);
      }
      game.drawnCards.push(randomNum);
    }
  },

  pairCards() {
    // clone drawn cards
    game.cardPairs = game.drawnCards.concat(game.drawnCards);
    console.log(game.cardPairs);
  },

  shuffleCards() {
    game.cardPairs = game.cardPairs.sort(() => Math.random() - 0.5);
    console.log(game.cardPairs);
  },

  startAnimation() {
    game.preventClicks = true;
    $(".game-board__list-wrapper p").text(`Level ${game.level}`);

    const $newDiv = $("<div>")
      .addClass("start-flag")
      .text("Game Start!")
      .css({
        transform: "translateX(-150px) translateY(-220px)",
        left: "-100%",
      })
      .appendTo(".game-board")
      .animate(
        {
          left: "50%",
        },
        400
      );

    setTimeout(() => {
      $newDiv.animate(
        {
          left: "300%",
        },
        300,
        () => {
          $newDiv.remove();
          game.playSound("gamestart");
          game.startTimer();
          game.preventClicks = false;
        }
      );
    }, 1000);
  },

  clearAnimation() {
    game.preventClicks = true;

    const $newDiv = $("<div>")
      .addClass("clear-flag")
      .text("Board Clear!")
      .css({
        transform: "translateX(-150px) translateY(-200px)",
        left: "-100%",
      })
      .appendTo(".game-board")
      .animate(
        {
          left: "50%",
        },
        400
      );

    setTimeout(() => {
      $newDiv.animate(
        {
          left: "300%",
        },
        300,
        () => {
          $newDiv.remove();
          game.preventClicks = false;
        }
      );
    }, 1000);
  },

  strikeOutAnimation() {
    game.preventClicks = true;

    const $newDiv = $("<div>")
      .addClass("strikeout-flag")
      .text("Strikeout!")
      .css({
        transform: "translateX(-150px) translateY(-200px)",
        left: "-100%",
      })
      .appendTo(".game-board")
      .animate(
        {
          left: "50%",
        },
        400
      );

    setTimeout(() => {
      $newDiv.animate(
        {
          left: "300%",
        },
        300,
        () => {
          $newDiv.remove();
          game.preventClicks = false;
        }
      );
    }, 1000);
  },

  miniGameAnimation() {
    game.preventClicks = true;

    const $newDiv = $("<div>")
      .addClass("minigame-flag")
      .text("Mini Game!")
      .css({
        left: "-100%",
      })
      .appendTo(".minigame-board")
      .animate(
        {
          left: "30%",
        },
        400
      );

    setTimeout(() => {
      $newDiv.animate(
        {
          left: 9999,
        },
        300,
        () => {
          $newDiv.remove();
          game.preventClicks = false;
        }
      );
    }, 1000);
  },

  displayCards() {
    game.startAnimation();

    for (let i = 0; i < game.cardPairs.length; i++) {
      const num = game.cardPairs[i];
      const delay = i * 50; // Adjust the delay time as needed (in milliseconds)

      const cardDomString = `<li class="game-board__list-item" data-num="${num}">
        <div class="front-view card-face">
          <img src="images/ball.jpeg" alt="" />
        </div>
        <div class="back-view card-face">
          <img src="images/card-${num}.jpeg"/>
        </div>
      </li>`;

      const $card = $(cardDomString);
      $card.css({
        position: "relative",
        left: "-900%",
      });
      $(".game-board__list").append($card);
      game.playSound("shufflingcards");

      // Use setTimeout to add delay before applying the transition
      setTimeout(() => {
        $card.css({
          left: 0,
          // transition: "left 0.1s ease",
        });
      }, delay);
    }
  },

  selectCard() {
    $(".game-board__list-item").on("click", (e) => {
      if (!game.preventClicks && !game.flipedCards.includes(e.target)) {
        $(e.target).addClass("flip");
        game.playSound("clickcard");
        game.flipedCards.push(e.target);

        if (game.flipedCards.length === 2) {
          console.log("check for match");
          game.preventClicks = true;
          game.checkMatch();
        }
      }
    });
  },

  checkMatch() {
    let cardOne = game.flipedCards[0],
      cardTwo = game.flipedCards[1];
    if ($(cardOne).data("num") === $(cardTwo).data("num")) {
      console.log("card matched");

      // make matched card elements unclickable and fade out, but still keep the spaces
      $(".game-board__list-item.flip").off("click").children().fadeOut(400);
      game.playSound("matched");
      game.preventClicks = false;
      game.flipedCards = [];
      // increase matched pairs
      game.matchedPairs++;
      if (game.matchedPairs === game.drawnCards.length) {
        // All pairs matched, level up
        console.log("level up");
        game.handleLevelUpLayout();
        game.player.updateScore();
        if (game.level > game.totalLevel) {
          // game.switchScreen("minigame");
          minigame.init();
          // game.miniGameAnimation();
          setTimeout(() => {
            game.switchScreen("minigame");
            game.miniGameAnimation();
          }, 1000);
        } else {
          game.clearAnimation();
          game.resetTimer();
          setTimeout(game.dealCards, 1400);
        }
      }
    } else {
      console.log("card not matched");

      setTimeout(game.deselectCards, 1000);

      setTimeout(() => {
        game.playSound("notmatched");
        $(".game-board__list-item.flip")
          .css("position", "relative")
          .animate(
            {
              left: "-=10px", // Move the element 10 pixels to the left
            },
            50
          )
          .animate(
            {
              left: "+=20px", // Move the element 20 pixels to the right
            },
            50
          )
          .animate(
            {
              left: "-=20px", // Move the element 20 pixels to the left
            },
            50
          )
          .animate(
            {
              left: "+=20px", // Move the element 20 pixels to the right
            },
            50
          )
          .animate(
            {
              left: "-=10px", // Move the element 10 pixels to the left
            },
            50
          );
      }, 500);
    }
  },

  deselectCards() {
    $(".game-board__list-item.flip").removeClass("flip");
    // allow user to click on cards to try again
    game.preventClicks = false;
    game.flipedCards = [];
  },

  /* ==== Timer functions ====*/

  resetTimer() {
    cancelAnimationFrame(game.animFrameID);
    console.log(game.totalTime);
    game.timeRemaining = game.totalTime;
    console.log(game.timeRemaining);
    game.isRunning = false;
    game.updateClock();
  },

  startTimer() {
    game.isRunning = true;
    game.animationFrameLoop();
  },

  pauseTimer() {
    game.isRunning = false;
    game.animationFrameLoop();
  },

  updateClock() {
    // Display min
    game.$min.text(
      Math.floor(this.timeRemaining / 1000 / 60).toString().length > 1
        ? Math.floor(this.timeRemaining / 1000 / 60)
        : "0" + Math.floor(this.timeRemaining / 1000 / 60)
    );

    // Display sec
    game.$sec.text(
      (Math.floor(this.timeRemaining / 1000) % 60).toString().length > 1
        ? Math.floor(this.timeRemaining / 1000) % 60
        : "0" + (Math.floor(this.timeRemaining / 1000) % 60)
    );

    // Display tenths sec
    game.$tenthsSec.text(
      Math.floor((this.timeRemaining % 1000) / 10).toString().length > 1
        ? Math.floor((this.timeRemaining % 1000) / 10)
        : "0" + Math.floor((this.timeRemaining % 1000) / 10)
    );
  },

  animationFrameLoop() {
    if (game.isRunning) {
      // Every resume, reset startTS
      game.startTS = null;
      game.animFrameID = requestAnimationFrame(game.animationFrameFunction);
    } else {
      window.cancelAnimationFrame(game.animFrameID);
    }
  },

  animationFrameFunction(timestamp) {
    if (!game.isRunning) {
      return;
    }

    if (game.startTS === null) {
      game.startTS = timestamp;
    }

    const elapsed = timestamp - game.startTS;

    if (game.timeRemaining <= 0) {
      console.log("time out");
      game.resetTimer();
      game.strikes++;

      if (game.strikes === 2 || game.strikes === 1) {
        $(".out span:nth-child(" + (game.strikes + 1) + ")").css(
          "background-color",
          "red"
        );
      }

      if (game.strikes === 3) {
        if (game.player.score > 0) {
          minigame.init();
          // game.miniGameAnimation();
          setTimeout(() => {
            game.switchScreen("minigame");
            game.miniGameAnimation();
          }, 1000);
        } else {
          game.switchScreen("gameover");
        }

        // game.player.score > 0
        //   ? game.switchScreen("minigame")
        //   : game.switchScreen("gameover");
      } else {
        game.flipedCards = [];
        game.strikeOutAnimation();
        setTimeout(game.dealCards, 1400);
      }
    } else if (elapsed >= game.loopDuration) {
      game.startTS = timestamp;
      game.timeRemaining -= elapsed;
      game.updateClock();
    }

    window.requestAnimationFrame(game.animationFrameFunction);
  },
};

const minigame = {
  // Dice values
  preventClicks: false,
  diceNum: null,
  ROTATION_MULTIPLIER: 4,
  diceCounter: 0,

  // Mini baseball game values
  baseballScore: 0,
  bases: [0, 0, 0],
  hit: null,

  init() {
    // minigame.diceCounter = game.player.score;
    minigame.diceCounter = 10;
    minigame.updateDicCounter();
    $(".roll").on("click", () => {
      if (minigame.diceCounter > 0) {
        // Prevent double click
        $(".roll").attr("disabled", true);
        // dice face back to 1
        $(".dice").removeAttr("style");
        setTimeout(minigame.randomDice, 550);
      }
    });
  },

  // Dice function

  updateDicCounter() {
    $(".minigame-board__dicecounter").text(minigame.diceCounter);
  },

  randomDice() {
    minigame.diceCounter--;
    minigame.updateDicCounter();

    const randomNum = Math.floor(Math.random() * 6 + 1);
    minigame.rollDice(randomNum);
  },

  rollDice(randomNum) {
    minigame.diceNum = randomNum;
    const randomRotation = Math.floor(Math.random() * 360 + 200);
    const randomRotation2 = Math.floor(Math.random() * 360 + 200);
    $(".dice").css(
      "transform",
      `translateY(-200px) rotateX(${
        randomRotation * minigame.ROTATION_MULTIPLIER
      }deg) rotateY(${randomRotation2 * minigame.ROTATION_MULTIPLIER}deg)`
    );

    setTimeout(() => {
      switch (randomNum) {
        case 1:
          $(".dice").css("transform", "rotateX(0deg) rotateY(0deg)");
          game.playSound("dicerolling2");
          minigame.handleHit();
          break;
        case 2:
          $(".dice").css("transform", "rotateX(90deg) rotateY(0deg)");
          game.playSound("dicerolling2");
          minigame.handleHit();
          break;
        case 3:
          $(".dice").css("transform", "rotateX(0deg) rotateY(-90deg)");
          game.playSound("dicerolling2");
          minigame.handleHit();
          break;
        case 4:
          $(".dice").css("transform", "rotateX(0deg) rotateY(90deg)");
          game.playSound("dicerolling2");
          minigame.handleHit();
          break;
        case 5:
          $(".dice").css("transform", "rotateX(-90deg) rotateY(0deg)");
          game.playSound("dicerolling2");
          minigame.handleHit();
          break;
        case 6:
          $(".dice").css("transform", "rotateX(180deg) rotateY(0deg)");
          game.playSound("dicerolling2");
          minigame.handleHit();
          break;
        default:
          break;
      }
    }, 550);
  },

  // Baseball functions

  updateBaseballScore() {
    $(".baseball-score").text(minigame.baseballScore);
    for (let i = 0; i < minigame.bases.length; i++) {
      if (minigame.bases[i] === 0) {
        $(".base").eq(i).css("background-color", "white");
      } else if (minigame.bases[i] === 1) {
        // change colour if someone is on base
        $(".base").eq(i).css("background-color", "red");
      }
    }
  },

  handleHit() {
    if (minigame.diceNum === 2 || minigame.diceNum === 1) {
      minigame.hit = "1B";
      minigame.calculateScore(minigame.hit);
      minigame.updateBaseballScore();
      setTimeout(() => {
        $(".roll").removeAttr("disabled");
      }, 1000);
    } else if (minigame.diceNum === 4 || minigame.diceNum === 3) {
      minigame.hit = "2B";
      minigame.calculateScore(minigame.hit);
      minigame.updateBaseballScore();
      setTimeout(() => {
        $(".roll").removeAttr("disabled");
      }, 1000);
    } else if (minigame.diceNum === 5) {
      minigame.hit = "3B";
      minigame.calculateScore(minigame.hit);
      minigame.updateBaseballScore();
      setTimeout(() => {
        $(".roll").removeAttr("disabled");
      }, 1000);
    } else if (minigame.diceNum === 6) {
      minigame.hit = "HR";
      minigame.calculateScore(minigame.hit);
      minigame.updateBaseballScore();
      setTimeout(() => {
        $(".roll").removeAttr("disabled");
      }, 1000);
    }
  },

  // This calculateScore function refers to chatGPT
  calculateScore(hit) {
    if (hit === "1B") {
      // 一壘安打
      minigame.baseballScore += minigame.bases[2]; // 加上本壘跑者得分
      minigame.bases[2] = minigame.bases[1]; // 三壘跑者移到本壘
      minigame.bases[1] = minigame.bases[0]; // 二壘跑者移到三壘
      minigame.bases[0] = 1; // 一壘放置新跑者
    } else if (hit === "2B") {
      // 二壘安打
      minigame.baseballScore += minigame.bases[2] + minigame.bases[1]; // 加上三壘和二壘跑者得分
      minigame.bases[2] = minigame.bases[0]; // 一壘跑者移到本壘
      minigame.bases[1] = 1; // 二壘放置新跑者
      minigame.bases[0] = 0; // 清空一壘
    } else if (hit === "3B") {
      // 三壘安打
      minigame.baseballScore +=
        minigame.bases[2] + minigame.bases[1] + minigame.bases[0]; // 加上三壘、二壘和一壘跑者得分
      minigame.bases[2] = 1; // 三壘放置新跑者
      minigame.bases[1] = minigame.bases[0] = 0; // 清空二壘和一壘
    } else if (hit === "HR") {
      // 全壘打
      minigame.baseballScore +=
        minigame.bases[2] + minigame.bases[1] + minigame.bases[0] + 1; // 加上所有跑者和自己的得分
      minigame.bases[2] = minigame.bases[1] = minigame.bases[0] = 0; // 清空所有壘包
    }
  },
};

$(game.init());
game.switchScreen("minigame");
minigame.init();

// 增加安打動畫
// mini game的flag跑到骰子底下
