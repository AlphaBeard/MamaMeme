const fs = require('fs');
const { State, Lobby, Start, Submission } = require('./States');

const POINT_MULTIPLIER = 100;

const EMIT_EVENT = {
    PLAYER_JOINED: 'playerJoined',
    LOAD_PLAYERS: 'loadPlayers'
}

class Message {
    constructor(event) {
        this.event = event;
        this.roomID = null;
        this.playerData = null;
        this.playersData = null;
    }
}

class Room {
    constructor(id, isPrivate, io) {
        this.id = id;
        this.private = isPrivate;
        this.full = false;
        this.players = [];
        this.io = io;
        this.ROOM_SIZE = 8;

        // this.answersSubmitted = 0;
        // this.votesSubmitted = 0;
        this.state = new Lobby(this);
    }

    addPlayer(username, socket) {
        let player = new Player(username, socket);
        this.players.push(player);
        if (this.players.length == this.ROOM_SIZE) this.full = true;
        if (this.players.length == 1) player.lead = true;
        //Create server message to client
        let message = new Message('playerJoined');
        message.playerData = player;
        //Send message to clients in room
        this.io.to(this.id).emit('messageFromServer', message);
    }
    removePlayer(name) {
        this.players = this.players.filter((player) => {
            return player.name != name;
        });
    }
    parseMessage(data, socket) {
        const playerData = data.playerData;
        const playersData = data.playersData;
        const EVENT = data.event;

        this.state.parseMessage(data, socket);
    }
    sendMeme() {
        let m_num = Math.floor(12 * Math.random());
        fs.readFile(`./img/${m_num}.jpg`, (err, data) => {
            this.io.to(this.id).emit('meme', { 'image': 'data:image/png;base64,' + data.toString('base64') });
        });
    }


    // answerSubmitted(data, socket, callback) {
    //     this.answersSubmitted++;
    //     socket.to(data.roomID).emit('answerSubmitted', { 'answer': data.answer, 'playerName': data.playerName });
    //     if (this.answersSubmitted == this.players.length) {
    //         this.startVoting(socket, callback);
    //     }
    // }
    // startVoting(socket, callback) {
    //     socket.to(data.roomID).emit('endRound');
    //     callback();

    //     this.countdown = VOTING_TIME;

    // }
    // submitVote(playerName, socket, callback) {
    //     this.votesSubmitted++;
    //     const playerVoted = this.players.findByName(playerName);
    //     playerVoted.addVote();

    //     if (this.votesSubmitted == this.players.length) {
    //         this.endVoting(socket, callback);
    //     }
    // }
    // endVoting(socket, callback) {
    //     console.log(`Ending round in room ${this.id}`);
    //     this.reset();
    //     socket.to(this.id).emit('endVoting', { 'players': this.players.playerList });
    //     callback({ 'players': this.players.playerList });
    // }
    // startRound(socket, callback) {
    //     let m_num = Math.floor(12 * Math.random());
    //     fs.readFile(`./img/${m_num}.jpg`, (err, data) => {
    //         socket.to(this.id).emit('startRound', { 'image': 'data:image/png;base64,' + data.toString('base64') });
    //         callback({ 'image': 'data:image/JPG;base64,' + data.toString('base64') });
    //     });
    // }


    // startGame(socket, callback) {
    //     // ADD MORE STUFF TO THE START OF THE GAME, LIKE VISUALS
    //     console.log(`Starting game in room ${this.id}...`);
    //     this.private = true;

    //     this.startRound(socket, callback);
    // }

    // reset() {
    //     this.votesSubmitted = 0;
    //     this.answersSubmitted = 0;
    // }

    static createID() {
        let A = 65;
        let Z = 90;
        let roomCode = '';
        for (let i = 0; i < 4; i++) {
            let ch_code = Math.floor(((Z - A) * Math.random())) + A;
            let ch = String.fromCharCode(ch_code);
            roomCode += ch;
        }
        return roomCode;
    }
    joinable() {
        return !this.private && !this.full && (this.players.length <= this.ROOM_SIZE);
    }
    print() {
        console.log(`***********************\nRoom ID: ${this.id}\nPrivate Room: ${this.private}\nJoinable: ${this.joinable()}\nPlayers: ${this.players.length}\n***********************`);
    }
}

class Player {
    constructor(name, socket) {
        this.name = name;
        this.lead = false;
        this.points = 0;
        this.socket = socket;
    }
    addVote() {
        this.points += POINT_MULTIPLIER;
    }
}

class RoomsArray {
    constructor() {
        this.roomList = [];
    }
    getRoomByID(id) {
        let room = this.roomList.find((room) => {
            return room.id == id;
        });
        if (room == undefined) room = false;
        return room;
    }
    addRoom(privateRoom, io) {
        // Generate unique room code and check if it's unique
        let id = Room.createID();
        while (this.getRoomByID(id)) {
            id = Room.createID();
        }
        let room = new Room(id, privateRoom, io);
        this.roomList.push(room);
        console.log(`--------Creating new room for Ext ${id}-------- `);
        return room;
    }
    findOpenRoom() {
        let room = this.roomList.find((room) => {
            return room.joinable() == true;
        });
        if (room == undefined) room = false;
        return room;
    }
    print() {
        console.log('----------------------------\n\tROOMS LIST\n----------------------------');
        this.roomList.forEach((room) => {
            room.print();
        });
    }
}

module.exports = { Room, RoomsArray, Message};