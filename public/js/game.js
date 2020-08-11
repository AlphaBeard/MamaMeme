const urlExt = window.location.href.split('/')[3];
// STATES = {
//     LOBBY: 1,
//     START: 2,
//     SUBMISSION: 3,
//     VOTING: 4,
//     SCORE: 5,
//     RESULTS: 6
// }

class Message {
    constructor(event) {
        let me = { ...room.myPlayer };
        me.card = null;
        me.submissionCard = null;
        me.answerCard = null;
        this.event = event;
        this.roomID = urlExt;
        this.playerData = me;
        this.playersData = null
    }
}

class Player {
    constructor(name, card, lead) {
        this.name = name;
        this.card = card;
        this.lead = lead;
        this.vote = undefined;
        this.answerCard = undefined;
        this.points = 0;
        this.roundVotes = 0;
    }
    addHostPrivilege() {
        console.log('You are the host!')
        let startBtn = ElementCreate.startButton();
        $('.game-content').append(startBtn);
    }
    addPoints(playerData) {
        this.roundVotes = playerData.roundVotes;
    }
    pointAnimation() {
        this.card.addClass('scored');
        this.points += 100;
        const score = 'Score: ' + this.points;
        this.card.children().text(score);
        document.getElementById('score_audio').play();
        setTimeout(() => { this.card.removeClass('scored'); }, 1000);
    }
    remove(){
        this.card.remove();
    }

}

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
        document.getElementById('blip_audio').play();
        const playerCard = ElementCreate.playerCard(name, { host: lead, score: 0 });
        $('.players').append(playerCard);
        let player = new Player(name, playerCard, lead);
        this.players.push(player);
        return player;
    }
    getPlayerByName(name) {
        return this.players.find((player) => {
            return player.name == name;
        });
    }
    removePlayer(name){
        const player = this.getPlayerByName(name);
        player.remove();
        this.players = this.players.filter(player=>{
            return player.name != name;
        });
    }
    addWaitPrompt() {
        this.waitPrompt = new WaitPrompt();
    }
    startRoundAnimations() {
        document.getElementById('round1_intro').play();
        document.getElementById('wait_music').play();
        $('#round-overlay').css('left', '0%');
        setTimeout(() => { $('#round-overlay').css('left', '100%'); }, 5000);
    }
    displayRoundScore() {
        let t = 2000, dt = 2000;
        this.players.forEach((player) => {
            const votes = player.roundVotes;
            for (let i = 0; i < votes; i++) {
                setTimeout(() => { player.pointAnimation(); }, t);
                t += dt;
            }
        });
    }
    requestStart() {
        $('#start-game-button').hide();
        const OUT_MSG = new Message('hostRequestStart');
        this.sendServerMessage(OUT_MSG);
    }
    submitAnswer() {
        const OUT_MSG = new Message('submitAnswer');
        OUT_MSG.answer = $('#user-answer').val();
        $('.card.answer-input').remove();
        this.sendServerMessage(OUT_MSG);
    }
    parseMessage(message) {
        this.state.parseMessage(message)
    }
    loadSubmissionElements() {
        document.getElementById('woosh_audio').play();
        $('body').addClass('hide-overflow');
        setTimeout(() => { $('body').removeClass('hide-overflow'); }, 1000);
        $('.meme-format-container').append(ElementCreate.meme(this.memes[0]));
        this.$board.append(ElementCreate.answerCard());
    }
    addHiddenSubmission(answer, playerName) {
        document.getElementById('bleep_audio').play();
        let player = this.getPlayerByName(playerName);
        let card = new Card(answer, player, this);
        player.submissionCard = card;
        $('.meme-answer-container').append(card.element);
        $('.vote-prompt').removeClass('hidden');
    }
    loadVotingElements() {
        let t = 500, dt = 2000;
        this.players.forEach((player) => {
            setTimeout(() => {
                player.submissionCard.reveal();
            }, t);
            t += dt;
        });
    }
    clearVotingElements() {
        $('.meme-format').remove();
        $('.reveal-card').remove();
        $('.vote-prompt').addClass('hidden');
        $('#answer-input').remove();
    }
    sendServerMessage(OUT_MSG) {
        this.socket.emit('messageFromClient', OUT_MSG);
    }

}
