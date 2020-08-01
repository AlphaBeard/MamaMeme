const urlExt = window.location.href.split('/')[3];
// STATES = {
//     LOBBY: 1,
//     START: 2,
//     SUBMISSION: 3,
//     VOTING: 4,
//     SCORE: 5,
//     RESULTS: 6
// }
const LISTEN_EVENT = {
    PLAYER_JOINED: 'playerJoined',
    LOAD_PLAYERS: 'loadPlayers'
}

class Message {
    constructor(event) {
        this.event = event;
        this.roomID = urlExt;
        this.playerData = room.myPlayer;
        this.playersData = null
    }
}

const CARD_REVEAL_INTERVAL = 2000;
const ROUND_TIME = 100;


class Room {
    constructor(socket) {
        this.players = [];
        this.socket = socket;
        this.myPlayer = null;
        this.myUsername = getCookie('username');
        this.$board = $('.game-content');
        this.memes = [];
        this.state = new Lobby(this);
    }

    addPlayer(name, lead) {
        const playerCard = ElementCreate.playerCard(name, { host: lead });
        $('.players').append(playerCard);
        let player = new Player(name, playerCard, lead);
        this.players.push(player);
        return player;
    }
    findPlayerByName(name) {
        return this.players.find((player) => {
            return player.name == name;
        });
    }
    requestStart() {
        $('#start-game-button').hide();
        const OUT_MSG = new Message('hostRequestStart');
        this.sendServerMessage(OUT_MSG);
    }
    submitAnswer(){
        const OUT_MSG = new Message('submitAnswer');
        OUT_MSG.answer = $('#user-answer').val();
        $('.card.answer-input').remove();
        this.sendServerMessage(OUT_MSG); 
    }
    parseMessage(message) {
        this.state.parseMessage(message)
    }
    startCountdown(time) {
        this.countdownClock = ElementCreate.countdownClock(time);
        this.$board.append(this.countdownClock);

        this.countdown = time;
        this.countInterval = setInterval(() => {
            this.countdown--;
            this.countdownClock.text(this.countdown);
            if (this.countdown <= 0) {
                clearInterval(this.countInterval);
            }
        }, 1000);
    }
    loadSubmissionElements() {
        const $memeIMG = $('.meme-format img');
        const $memeContainer = $('.meme-format');

        $memeIMG.addClass('hidden');
        $memeIMG.removeClass('hidden');
        $memeContainer.addClass('card-toss');
        console.log(this.memes);
        $memeIMG.attr('src', this.memes[0]);
        setTimeout(() => { $('.meme-format').removeClass('card-toss'); }, 2000);

        this.$board.append(ElementCreate.answerCard());
    }
    sendServerMessage(OUT_MSG) {
        this.socket.emit('messageFromClient', OUT_MSG);
    }

}

// startGame(meme) {
//     this.stage = STAGES.START;
//     this.startRound(meme);
// }
// loadMeme(img) {
//     this.$memeImage.removeClass('hidden');
//     $('.meme-format').addClass('card-toss');
//     this.$memeContainer.attr('src', img);

//     setTimeout(() => { $('.meme-format').removeClass('card-toss'); }, 2000);
// }
// addHiddenAnswer(text, playerName) {
//     let player = this.findPlayerByName(playerName);
//     let card = new Card(text, player);
//     player.answerCard = card;
//     this.$memeAnswers.append(card.element);
// }
// startRound(meme) {
//     $('.reveal-card').remove()
//     this.$memeImage.addClass('hidden');

//     this.stage = STAGES.WRITE_ANSWERS;
//     const countdownClock = ElementCreate.countdownClock(ROUND_TIME);
//     this.$board.append(countdownClock);
//     this.startCountDown(ROUND_TIME, countdownClock);

//     this.$board.append(ElementCreate.answerCard());


//     this.loadMeme(meme);
// }
// startCountDown(seconds, countdownElement, emitEvent) {
//     this.countdown = seconds;
//     this.countInterval = setInterval(() => {
//         this.countdown--;
//         countdownElement.text(this.countdown);
//         if (this.countdown < 0) {
//             clearInterval(this.countInterval);
//         }
//     }, 1000);
// }
// endVoting(playersData) {
//     clearInterval(this.countInterval);
//     $('.vote-prompt').addClass('hidden');
//     let t = 0, dt = 2000;
//     playersData.forEach((playerData) => {
//         console.log(playerData)
//         let player = room.findPlayerByName(playerData.username);
//         player.points = playerData.points;
//     });
//     setTimeout(() => {
//         if (myPlayer.lead) {
//             socket.emit('hostRequestStartRound', { 'roomID': urlExt }, (data) => {
//                 memes.unshift(data.image);
//                 room.startRound(memes[0]);
//             });
//         }
//     }, t);
// }
// endRound() {
//     this.stage = STAGES.VOTING;
//     $('.countdown-clock').remove();
//     $('.vote-prompt').removeClass('hidden');

//     //Reveal all answers 1 by 1
//     let t = 0, dt = CARD_REVEAL_INTERVAL;
//     this.players.forEach((player) => {
//         setTimeout(() => {
//             player.answerCard.reveal();
//         }, t);
//         t += dt;
//     });
//     //Now wait for voting to end
// }

// }


class Player {
    constructor(name, card, lead) {
        this.name = name;
        this.playerCardElement = card;
        this.lead = lead;
        this.vote = undefined;
        this.answerCard = undefined;
        this.points = 0;
    }
    addHostPrivilege() {
        console.log('You are the host!')
        let startBtn = ElementCreate.startButton();
        $('.game-content').append(startBtn);
    }

}