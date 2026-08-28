import { Game } from './core/Game.js';
import { Input } from './player/Input.js';
import { Player } from './player/Player.js';
import { Hub } from './world/Hub.js';
import { UI } from './ui/UI.js';

const game = new Game();
const ui = new UI();
const input = new Input(game);
const player = new Player(game, input);
player.input = input;

game.add(player);
game.add(new Hub(game, player, ui));
game.start();

player.loadModel('/models/scientist.glb');