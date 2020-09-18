import * as Phaser from 'phaser';
import { SceneMainMenu } from "./SceneMainMenu";
import { SceneMain } from "./SceneMain";
import { SceneGameOver } from "./SceneGameOver";

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
    active: false,
    visible: false,
    key: "Game"
}

const gameConfig: Phaser.Types.Core.GameConfig = {
    title: 'Some Weird Gravity Space Game',

    type: Phaser.WEBGL,

    scale: {
        width: window.innerWidth,
        height: window.innerHeight,
    },

    physics: {
        default: 'arcade',
        arcade: {
            // debug: true,
            fps: 30,
        },
    },
    scene: [SceneMainMenu, SceneMain, SceneGameOver],

    parent: 'game',
    backgroundColor: '#000000',
};

export const game = new Phaser.Game(gameConfig);