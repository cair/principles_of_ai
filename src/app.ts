import Phaser from 'phaser'
import GameConfig = Phaser.Types.Core.GameConfig;
import Scene = Phaser.Scene;
import Sprite = Phaser.GameObjects.Sprite;
import Graphics = Phaser.GameObjects.Graphics;
import Grid = Phaser.GameObjects.Grid;
import $ from "jquery";
import MaxAdd = Phaser.Math.MaxAdd;

class HTMLMenu{
    static currentGame: any = null;
    constructor(game: Game){
    }

    static setup(game: Game){
        if(this.currentGame !== null){
            this.currentGame.game.destroy(true);
        }
        this.currentGame = game;

        $("#to_menu").off("click");
        $("#to_menu").on("click", (event) => {
            HTMLMenu.toMenu();
        });

        $("#save_reset").off("click");
        $("#save_reset").on("click", (event) => {
            on_load();
        });

    }

    static getAgentEnabled(){
        return $("#agent").is(":checked");
    }

    static getPOMDPEnabled(){
        return $("#pomdp").is(":checked");
    }
    static getGridSize(){
        // @ts-ignore
        return parseInt($("#grid_size").val().toString());
    }

    static getAgentSpeed(){
        // @ts-ignore
        return parseInt($("#agent_speed").val().toString());
    }


    static toMenu() {
        document.location.reload()
    }



}

class Console{

    colors: any = {
        "info": "#add8e6",
        "warning": "#FF8C00",
        "danger": "#FF4500",
        "success": "#22bb33"
    };

    count: integer = 0;
    ele: HTMLDivElement;
    constructor(id: string){
        this.ele = <HTMLDivElement>document.getElementById(id);
    }

    addLine(type:string, text: string){
        let item = <HTMLDivElement>document.createElement("div");
        item.setAttribute("style", "background-color: " + this.colors[type]);
        item.innerText = ++this.count + ": " + text;


        this.ele.prepend(item);
    }
}

class Preload extends Scene{
    constructor() {
        super({ key: 'preload'});
        console.log("Preload!")
    }

    preload()
    {
        this.load.image("menu_bg", "images/menu_bg.jpg");
        this.load.image("wumpus", "images/wumpus.png");
        this.load.image("pit", "images/pit.png");
        this.load.image("gold", "images/gold.png");
        this.load.image("entrance", "images/entrance.png");
    }

    create(){
        this.scene.start("menu", {})
    }

}

class Menu extends Scene {
    menuGraphics: Graphics;
    bg: Sprite;
    menu_start_x = 0;
    menu_start_y = 0;
    menu_select_idx = 0;
    menu_options: any = {
        "Grid-world": {
            scene: "gridworld",
            args: {}
        },
        "Wumpus": {
            scene: "wumpus",
            args: {}
        },
        "Exit": {
            scene: "exit",
            args: {}
        }

    };


    constructor() {
        super({ key: 'menu'});
        console.log("Menu!")
    }

    create() {
        let { width, height } = this.sys.game.canvas;

        // Background
        this.bg = this.add.sprite(width / 2, height / 2, 'menu_bg');
        this.bg.setDisplaySize(width, height);

        // Create the menu
        this.menuGraphics = this._create_menu();

        // Create event listener for keyboard
        this._create_keyboard_listener();
    }

    _action_menu_up(){
        if(this.menu_select_idx - 1 < 0){
            this.menu_select_idx = Object.keys(this.menu_options).length - 1
        }else{
            this.menu_select_idx = (this.menu_select_idx - 1) % Object.keys(this.menu_options).length;
        }

        this._create_menu()
    }

    _action_menu_down(){
        this.menu_select_idx = (this.menu_select_idx + 1) % Object.keys(this.menu_options).length;
        this._create_menu()
    }

    _action_menu_select(){
        let keys = Object.keys(this.menu_options);
        let button_data = this.menu_options[keys[this.menu_select_idx]];
        this.scene.start(button_data['scene'], button_data['args'])
    }

    _create_keyboard_listener(){
        return [
            this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W).on('down', this._action_menu_up, this),
            this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP).on('down', this._action_menu_up, this),

            this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S).on('down', this._action_menu_down, this),
            this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN).on('down', this._action_menu_down, this),

            this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER).on('down', this._action_menu_select, this),
            this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE).on('down', this._action_menu_select, this),

        ]

    }

    _create_menu(){
        if(this.menuGraphics){
            this.menuGraphics.clear();
        }
        let { width, height } = this.sys.game.canvas;
        let w_menu = width * .2;
        let h_menu = height* .1;
        let spacing_menu = h_menu + height * .05;

        let container = this.add.container(
            width / 2,
            height / 2,
        );
        let graphics = this.add.graphics({
            lineStyle: { color: 0x00ff00 }
        });


        let i = 0;
        for(let k in this.menu_options){
            graphics.fillStyle((this.menu_select_idx === i ) ? 0xC0C0C0 :  0xffffff);
            graphics.lineStyle(5, (this.menu_select_idx === i ) ? 0xff0000 :  0x00ff00);

            let rect = new Phaser.Geom.Rectangle(
                -(w_menu/2),
                (-h_menu) + (spacing_menu * i),
                w_menu,
                h_menu
            );



            let text = this.add.text(rect.x, rect.y, k, {
                fontFamily: 'Verdana, "Times New Roman", Tahoma, serif',
                color: 0xffffff,
                fontSize: '32px',
            });

            text.setOrigin(-0.5, -0.5);

            container.add(graphics);
            container.add(text);


            graphics.fillRectShape(rect);
            graphics.strokeRectShape(rect);
            i++;

        }

        return graphics;

        //graphics.setInteractive(rect);
    }


}



interface Position {
    x: number;
    y: number;

    maxX: number;
    maxY: number;

    initialX: number;
    initialY: number;

}

enum TileType {
    PLAYER = 1,
    WALL= 2,
    GOAL= 3,
    TRAP = 4,
    GOLD = 5,
    PIT = 6,
    WUMPUS = 7,
    DARKNESS = 8,
    ENTRANCE= 9
}

class TileData{


 static data: any = {
        3: { // Goal, see enum
            type: "graphics",
            data: {
                lineStyle: {color: 0x000000},
                fillStyle: {color: 0x00ff00}
            }

        },
        4: { // Trap, see enum
            type: "graphics",
            data: {
                lineStyle: {color: 0x000000},
                fillStyle: {color: 0xff0000}
            }

        },
        2: { // Wall, see enum
            type: "graphics",
            data: {
                lineStyle: {color: 0x000000},
                fillStyle: {color: 0x000000}
            }

        },
        1: {  // Player, see enum
            type: "graphics",
            data: {
                lineStyle: {color: 0x000000},
                fillStyle: {color: 0x9999FF}
            }
        },
        5: { // Gold, see enum
            type: "image",
            data: {
                path: "images/gold.png",
                name: "gold"
            }
        },
        6: { // PIT, see enum
            type: "image",
            data: {
                path: "images/pit.png",
                name: "pit"
            }
        },
        7: { // Wumpus, see enum
            type: "image",
            data: {
                path: "images/wumpus.png",
                name: "wumpus"
            }
        },
        8: { // Darkness, see enum
            type: "graphics",
            data: {
                lineStyle: {color: 0x000000},
                fillStyle: {color: 0x000000}
            }
        },
        9: { // Entrance, see enum
            type: "image",
            data: {
                path: "images/entrance.png",
                name: "entrance"
            }
        },

    };

    static get(id: number){
        return TileData.data[id];
    }
}

class Movable implements Position{

    initialX: number;
    initialY: number;

    constructor(protected scene: Gridworld, public x: number,  public y:number,  public maxX:number,  public maxY:number){
        this.initialX = x;
        this.initialY = y;
    }

    reset(){
        this.x = this.initialX;
        this.y = this.initialY;
    }

    moveDown(): void{
        this.y = Math.min(this.y + 1, this.maxY)
    }

    moveUp(): void {
        this.y = Math.max(this.y - 1, 0)
    }

    moveLeft(): void{
        this.x = Math.max(this.x - 1, 0)
    }

    moveRight(): void{
        this.x = Math.min(this.x + 1, this.maxX)
    }



}

class ColorGradient{

    static percentColors = [
        { pct: 0.0, color: { r: 0xff, g: 0x00, b: 0 } },
        { pct: 0.5, color: { r: 0xff, g: 0xff, b: 0 } },
        { pct: 1.01, color: { r: 0x00, g: 0xff, b: 0 } } ];

    static componentToHex(c: number) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }

    static rgbToHex(r:number, g:number, b:number) {
        return "0x" + ColorGradient.componentToHex(r) + ColorGradient.componentToHex(g) + ColorGradient.componentToHex(b);
    }

    static get = function(pct: number) {
        for (var i = 1; i < ColorGradient.percentColors.length - 1; i++) {
            if (pct <= ColorGradient.percentColors[i].pct) {
                break;
            }
        }
        var lower = ColorGradient.percentColors[i - 1];
        var upper = ColorGradient.percentColors[i];
        var range = upper.pct - lower.pct;
        var rangePct = (pct - lower.pct) / range;
        var pctLower = 1 - rangePct;
        var pctUpper = rangePct;
        var color = {
            r: Math.floor(lower.color.r * pctLower + upper.color.r * pctUpper),
            g: Math.floor(lower.color.g * pctLower + upper.color.g * pctUpper),
            b: Math.floor(lower.color.b * pctLower + upper.color.b * pctUpper)
        };
        return ColorGradient.rgbToHex(color.r, color.g, color.b);
        // or output as hex if preferred

    }


}


class TileObject extends Movable{
    sprite: Sprite;


    constructor(protected scene: Gridworld, public type: TileType, public x: number, public y: number) {
        super(scene, x, y, scene.config.grid_w - 1, scene.config.grid_h - 1); // - 1 because it goes from 0 to (max-1)

    }

    createAndGetTextureName(): {type: string, textureName: string}{

        let tileData = TileData.get(this.type);
        if(tileData.type === "graphics"){
            let graphics = this.scene.add.graphics(tileData.data);
            let texture_key = this.type + "_texture";

            let rect = new Phaser.Geom.Rectangle(0, 0, this.scene.cell_width, this.scene.cell_height);
            graphics.fillRectShape(rect);
            graphics.strokeRectShape(rect);

            graphics.generateTexture(texture_key);
            graphics.destroy();
            return {type: 'graphics', textureName: texture_key}

        } else if(tileData.type === "image") {
            return {type: 'image', textureName: tileData.data.name}
        }


        // Should not happen.
        return {type: 'SHOULD NOT HAPPEN', textureName: ''};

    }


    reset() {
        super.reset();

        this.updatePosition();
    }

    create(){
        let {type, textureName} = this.createAndGetTextureName();



        let {x, y} = this.getPixelPosition();
        this.sprite = this.scene.add.sprite(x, y, textureName);
        if(type === "image"){
            this.sprite.setDisplaySize(this.scene.cell_width, this.scene.cell_height);
            this.sprite.setSize(this.scene.cell_width, this.scene.cell_height);
        }
        this.sprite.setOrigin(0, 0);
        this.updatePosition()
    }

    getPixelPosition(){
        return {
            x: this.x * this.scene.cell_width,
            y: this.y * this.scene.cell_height
        }
    }

    updatePosition(){
        let {x, y} = this.getPixelPosition();
        this.sprite.setPosition(x, y);
    }

}




class Player extends TileObject{

    controller: any = {
        0: {
            keys: [
                Phaser.Input.Keyboard.KeyCodes.W,
                Phaser.Input.Keyboard.KeyCodes.UP
            ],
            fn: this.moveUp
        },
        1: {
            keys: [
                Phaser.Input.Keyboard.KeyCodes.S,
                Phaser.Input.Keyboard.KeyCodes.DOWN
            ],
            fn: this.moveDown
        },
        2: {
            keys: [
                Phaser.Input.Keyboard.KeyCodes.A,
                Phaser.Input.Keyboard.KeyCodes.LEFT
            ],
            fn: this.moveLeft
        },
        3: {
            keys: [
                Phaser.Input.Keyboard.KeyCodes.D,
                Phaser.Input.Keyboard.KeyCodes.RIGHT
            ],
            fn: this.moveRight
        }
    };

    constructor(protected scene: Gridworld, public x:number, public y:number){
        super(scene, TileType.PLAYER, x, y);
        this._create_controller();
        this.create();
    }

    trigger_action(direction: integer){
        let old_pos = {x: this.x, y: this.y};
        this.controller[direction]['fn'].bind(this)();
        let new_pos = {x: this.x, y: this.y};

        let {isValid, rewardType} =this.scene.evaluate_move(this, old_pos, new_pos);

        if(!isValid){
            // Move was not legal, revert action
            this.x = old_pos.x;
            this.y = old_pos.y;
        }

        // UPDATE Reward
        this.scene.rewards.push(
            this.scene.reward_function(this, rewardType)
        );


        this.updatePosition();
    }

    _create_controller(){
        for(let direction in this.controller){
            let keys = this.controller[direction]["keys"];

            for(let key_idx in keys){
                this.scene.input.keyboard.addKey(keys[key_idx]).on('down', (event: any) => {
                    let ret = <any>this.scene.step.bind(this.scene, parseInt(direction))();
                }, this)

            }


        }
    }
}

class Gridworld extends Scene{
    grid: Grid;
    isGame = true;
    config: any = {
        grid_w: 10, // TODO - dynamic set
        grid_h: 10, // TODO - dynamic set
        player_x: 0, // TODO - dynamic set
        player_y: 9, // TODO - dynamic set
    };

    console = new Console("console");

    rewards: number[] = [];
    reward_function: any = (scene: any, hint?: string) => {
        if(hint){
            // Hint is set
            if(hint === "goal"){
                return 1; // Reward for entering goal
            }else if(hint === "trap"){
                return -1; // Reward for entering trap
            }else if(hint === "walk"){
                return -0.001; // Reward for walking
            }
        }
    };

    triangleOverlay: any = [];

    tiles: TileObject[] = [
        // Goal Tiles
        new TileObject(this,TileType.GOAL, 9, 0),

        // Wall Tiles
        new TileObject(this, TileType.WALL, 4, 5),
        new TileObject(this, TileType.WALL, 5, 5),
        new TileObject(this, TileType.WALL, 6, 5),
        new TileObject(this, TileType.WALL, 4, 4),
        new TileObject(this, TileType.WALL, 5, 4),
        new TileObject(this, TileType.WALL, 6, 4),
        new TileObject(this, TileType.WALL, 4, 3),
        new TileObject(this, TileType.WALL, 5, 3),
        new TileObject(this, TileType.WALL, 6, 3),


        // Trap Tiles
        new TileObject(this, TileType.TRAP, 9, 1),

    ];

    cell_width: number; // Set in create();
    cell_height: number; // Set in create();
    player: Player;
    isTerminal: boolean = false;

    constructor(key: string | Phaser.Types.Scenes.SettingsConfig) {
        super((key) ? key : { key: 'gridworld'});
        this.config.grid_w = HTMLMenu.getGridSize();
        this.config.grid_h = HTMLMenu.getGridSize();

    }

    create() {
        this._create_static_grid();
        this._create_triangle_overlay();
        this._create_player();
        this._create_tiles();



    }


    _create_triangle_overlay(){
        let { width, height } = this.sys.game.canvas;

        this.cell_width = width / this.config.grid_w;
        this.cell_height = height / this.config.grid_h;

        // Up
        let upTriangle = this.add.graphics();
        upTriangle.fillStyle(0xFFFFFF, 1.0);
        upTriangle.fillTriangle(0, 0, this.cell_width, 0, this.cell_width / 2, this.cell_height / 2);
        upTriangle.generateTexture("triangle_up");

        // Down
        let downTriangle = this.add.graphics();
        downTriangle.fillStyle(0xFFFFFF, 1.0);
        downTriangle.fillTriangle(0, this.cell_height, this.cell_width, this.cell_height, this.cell_width / 2, this.cell_height / 2);

        downTriangle.generateTexture("triangle_down");

        let leftTriangle = this.add.graphics();
        leftTriangle.fillStyle(0xFFFFFF, 1.0);
        leftTriangle.fillTriangle(0, 0, 0, this.cell_height, this.cell_width / 2, this.cell_height / 2);
        leftTriangle.generateTexture("triangle_left");

        let rightTriangle = this.add.graphics();
        rightTriangle.fillStyle(0xFFFFFF, 1.0);
        rightTriangle.fillTriangle(this.cell_width, 0, this.cell_width, this.cell_height, this.cell_width / 2, this.cell_height / 2);
        rightTriangle.generateTexture("triangle_right");

        for(let i = 0; i < this.config.grid_h * this.config.grid_w; i++){

            let {x, y} = this.indexToXY(i);
            let pixelXStart = x * this.cell_width;
            let pixelYStart = y * this.cell_height;


            let up = this.add.sprite(pixelXStart, pixelYStart, "triangle_up");
            up.setOrigin(0, 0);
            let down = this.add.sprite(pixelXStart, pixelYStart, "triangle_down");
            down.setOrigin(0, 0);
            let left = this.add.sprite(pixelXStart, pixelYStart, "triangle_left");
            left.setOrigin(0, 0);
            let right = this.add.sprite(pixelXStart, pixelYStart, "triangle_right");
            right.setOrigin(0, 0);
            this.triangleOverlay.push([up, down, left, right])
        }
    }

    isCollision(obj1: Movable, obj2: Movable) {
        return (obj1.x == obj2.x && obj1.y == obj2.y);
    }

    reset(){

        this.player.reset();
        this.tiles.forEach((tile) => {
            tile.reset();
        })

        return this.getState();
    }

    getState(){
        return this.XYtoIndex(this.player.x, this.player.y);
    }

    cellOverlay(data: any){

        let cellItems = this.triangleOverlay[data.s];

        let percentage_list = this._list_to_percentage(data.data);

        for(let i = 0; i < percentage_list.length; i++){
            let cell = cellItems[i];
            let percentage = percentage_list[i];
            let color = ColorGradient.get(percentage);

            cell.tint = color;

        }


    }

    _list_to_percentage(list: []){

        let maxVal = Math.max(...list);
        let newlist = list.map((val)=>{
            let ratio = (val + 1) / (maxVal + 1);
            ratio = Math.min(1, ratio);
            ratio = Math.max(0, ratio);
            return ratio;
        });
        return newlist;
    }


    step(action: number){
        let s0 = this.getState();
        let a = action;
        let r = null;
        let s1 = null;
        let t = null;


        if(action < 0 || action > Object.keys(this.player.controller).length){
            console.error("Invalid action!");
            return [null, null, null, null, null];  // s, a, r, s1, t
        }else{
            this.player.trigger_action(action);
            r = this.rewards.slice(-1)[0];
            s1 = this.getState()
            t = this.isTerminal;
        }

        this.updateState();
        this.console.addLine("info", "State: " + s0 + ", Action: " + a + ", Reward: " + r + ", Next State: " + s1 + ", Is Terminal: " + t)

        return {
            s: s0,
            a: a,
            r: r,
            s1: s1,
            t: t
        }
    }

    updateState(){
        if(this.isTerminal){
            this.reset();
        }
        this.isTerminal = false;
    }

    evaluate_move(obj: Movable, old_pos: any, new_pos: any): {isValid: boolean, rewardType: string}{
        let isValid = true;
        let rewardType = "walk";
        this.tiles.forEach((tile) => {

            // Check if player and tile has collided
            let collision = this.isCollision(obj, tile);

            if(!collision){
                // No collision
                return
            }

            if(tile.type == TileType.GOAL) {
                // Terminal and reward
                rewardType = "goal";
                this.isTerminal = true;


            }else if(tile.type == TileType.TRAP) {
                // Terminal and punishment
                rewardType = "trap";
                this.isTerminal = true;

            } else if(tile.type == TileType.WALL) {
                // Invalid mode. Revert to previous position
                isValid = false;
            }

        });


        return {
            isValid: isValid,
            rewardType: rewardType
        };

    }

    indexToXY(i: number){
        return {
            x: i % this.config.grid_w,
            y: Math.floor(i / this.config.grid_w)
        }
    }

    XYtoIndex(x: number, y: number){
        return x + this.config.grid_w*y;
    }

    _create_player(){
       this.player = new Player(this, this.config.player_x, this.config.player_y);
    }

    _create_tiles(){
        this.tiles.forEach((tile) => {
            tile.create();
        })
    }

    _create_static_grid(){
        let { width, height } = this.sys.game.canvas;

        this.cell_width = width / this.config.grid_w;
        this.cell_height = height / this.config.grid_h;

        this.grid = this.add.grid(
            0,
            0,
            width,
            height,
            this.cell_width,
            this.cell_height,
            0xC0C0C0,
            1,
            0xffffff
        );
        this.grid.setOrigin(0, 0);

        // Generate state names (numbers)
        for(let i = 0; i < this.config.grid_w * this.config.grid_h; i++){
            let {x, y} = this.indexToXY(i);

            this.add.text(x * this.cell_width,y * this.cell_height, i.toString())

        }

    }

}

class Wumpus extends Gridworld{
    // http://www.kr.tuwien.ac.at/students/prak_wumpusjava/simulator/Rules.html
    // https://github.com/yassinebelmamoun/wumpus-hunting-Qlearning

    config: any = {
        grid_w: 10, // TODO - dynamic set
        grid_h: 10, // TODO - dynamic set
        player_x: 0, // TODO - dynamic set
        player_y: 9, // TODO - dynamic set
        pomdp: false
    };

    tiles: TileObject[] = [
        // Gold
        new TileObject(this, TileType.GOLD, 1, 2),
        new TileObject(this, TileType.GOLD, 5, 2),
        new TileObject(this, TileType.GOLD, 9, 7),
        new TileObject(this, TileType.GOLD, 0, 0),
        new TileObject(this, TileType.GOLD, 4, 9),
        // Hole/Pit
        new TileObject(this, TileType.PIT, 2, 6),
        new TileObject(this, TileType.PIT, 3, 9),
        new TileObject(this, TileType.PIT, 0, 4),
        new TileObject(this, TileType.PIT, 5, 5),
        new TileObject(this, TileType.PIT, 9, 4),
        new TileObject(this, TileType.PIT, 7, 2),
        new TileObject(this, TileType.PIT, 3, 3),

        // Wumpus Tile
        new TileObject(this,TileType.WUMPUS, 4, 2),

        // Entrance Tile
        new TileObject(this,TileType.ENTRANCE, 4, 0),


        // Darkness (Nothing)
        //new TileObject(this, TileType.TRAP, 9, 1), // We do this iteratively
    ];

    reward_function: any = (scene: any, hint?: string) => {
        if(hint){
            // Hint is set
            if(hint === "gold"){
                return 1; // Reward for entering goal
            }else if(hint === "pit"){
                return -1; // Reward for entering trap
            }else if(hint === "walk"){
                return -0.001; // Reward for walking
            }else if(hint === "wumpus"){
                return -10.00; // Reward for walking
            }else if(hint === "entrance"){
                return 10;
            }
        }
    };

    constructor() {
        super({ key: 'wumpus'});
        this.config.pomdp = HTMLMenu.getPOMDPEnabled();
    }

    _create_darkness(){
        for(let i = 0; i < this.config.grid_h * this.config.grid_w; i++) {
            let {x, y} = this.indexToXY(i);

            let darkness_tile = new TileObject(this, TileType.DARKNESS, x, y);
            darkness_tile.create();

            this.tiles.push(darkness_tile)
        }
    }


    evaluate_move(obj: Movable, old_pos: any, new_pos: any): {isValid: boolean, rewardType: string}{
        //return super.evaluate_move(obj, old_pos, new_pos);
        // returns is_valid
        let isValid = true;
        let rewardType = "walk";

        let newTile = this.tiles.filter((item) => {
            return item.x == new_pos.x && item.y == new_pos.y;
        })[0];


        if(newTile.type == TileType.PIT){
            rewardType = "pit";
            this.isTerminal = true;
        }else if(newTile.type == TileType.GOLD && newTile.sprite.visible){
            newTile.sprite.setVisible(false);
            rewardType = "gold";
        }else if(newTile.type == TileType.WUMPUS){
            rewardType = "wumpus";
            this.isTerminal = true;
        }else if(newTile.type == TileType.ENTRANCE){

            // Count visible gold
            let visibleGoldCount = this.tiles.filter((item) => {
                return item.type === TileType.GOLD && item.sprite.visible
            }).length;

            if(visibleGoldCount === 0) {
                rewardType = "entrance";
                this.isTerminal = true;
            }

        }



        return {
            isValid: isValid,
            rewardType: rewardType
        };


    }

    reset() {
        // Set gold to visible again.
        this.tiles.filter((item) => {
            return item.type === TileType.GOLD;
        }).forEach((item) => {
            item.sprite.setVisible(true);
        });
        this._set_visibility((this.config.pomdp) ? "on" : "off");

        return super.reset();
    }

    step(action: number): any {
        let ret = super.step(action);
        this._set_visibility();
        this._evaluateHints();
        return ret;
    }

    _checkAroundPlayer(type: TileType){
        let locations = [
            [this.player.x - 1, this.player.y],
            [this.player.x + 1, this.player.y],
            [this.player.x, this.player.y - 1],
            [this.player.x, this.player.y + 1],
        ];

        let result = this.tiles.filter((tile) => {
            return tile.type === type && locations.filter((loc) => {
                return tile.x == loc[0] && tile.y == loc[1];
            }).length > 0
        });

        return result;

    }

    _evaluateHints(){

        if(this._checkAroundPlayer(TileType.PIT).length > 0) {
            this.console.addLine("warning", "You feel a breeze")
        }

        if(this._checkAroundPlayer(TileType.WUMPUS).length > 0) {
            this.console.addLine("danger", "You smell a wumpus")
        }

        if(this._checkAroundPlayer(TileType.ENTRANCE).length > 0) {
            this.console.addLine("success", "You see a bright light")
        }




    }

    _set_visibility(set?: string){
        this.tiles.forEach((tile) => {
            if(tile.type !== TileType.DARKNESS){
                return;
            }

            if(this.isCollision(this.player, tile)){
                tile.sprite.setVisible(false);
                return;
            }

            if(set === "on"){
                tile.sprite.setVisible(true);
            }else if(set === "off"){
                tile.sprite.setVisible(false);
            }



        })

    }

    create() {
        super.create();
        this._create_darkness();
        this._set_visibility((this.config.pomdp) ? "on" : "off");

    }

}


class Game{


    constructor() {
        let gameConfig: GameConfig = {
            type: Phaser.AUTO,
            width: window.innerWidth,
            height: window.innerHeight - 100,
            scene: [Preload, Menu, Gridworld, Wumpus],
            backgroundColor: "#dbcf8b",
        };
        this.game = new Phaser.Game(gameConfig);
    }

    _getGameScene(){

        let activeScene = <any>this.game.scene.getScenes(true)[0];

        if(!activeScene  || !activeScene.hasOwnProperty('isGame')){
            return null;
        }

        return activeScene
    }

    step(action: number) {
        let activeScene = this._getGameScene();
        if(!activeScene){
            return null;
        }

        return activeScene.step(action)

    }

    reset(){
        let activeScene = this._getGameScene();
        if(!activeScene){
            return null;
        }

        return activeScene.reset();
    }

    cellOverlay(data: any){
        let activeScene = this._getGameScene();
        if(!activeScene){
            return null;
        }

        activeScene.cellOverlay(data);


    }


    game: Phaser.Game;


    create() {
    }
}


class QLearning{

    private Q: any = {};
    private epsilon: number ;

    constructor(
        private num_actions: number,
        private gamma: number = 0.99,
        private learning_rate: number = 0.1,
        private e_start: number = 1.0,
        private e_end: number = 0.01,
        private e_decay: number = 0.0005

    ){
        this.epsilon = this.e_start;
    }

    predict(state: integer){
        this._state_exists(state);

        let action = null;

        if(Math.random() < this.epsilon) {
            // Random action
            action = this._randrange(0, this.num_actions);

        } else {
            // Greedy-selection (max)
            action = this._argmax(this.Q[state])
        }

        // Decay epsilon
        this.epsilon = Math.max(this.e_end, this.epsilon - this.e_decay);

        return action;

    }

    learn(s: number, a: number, r: number, s1: number, t: number){
        this._state_exists(s1);
        this.Q[s][a] = this.Q[s][a] + this.learning_rate * (r + this.gamma * Math.max(...this.Q[s1]) - this.Q[s][a])


    }

    _state_exists(state: number){
        let exists_in_map = (state in this.Q);
        if(!exists_in_map) {
            // Initial state in the table and fill with zeros
            this.Q[state] = new Array(this.num_actions);
            this.Q[state].fill(0);
        }

    }

    _argmax(array: any[]) {
        // @ts-ignore
        return [].map.call(array, (x, i) => [x, i]).reduce((r, a) => (a[0] > r[0] ? a : r))[1];
    }

    _randrange(min: number, max:number) {
        return Math.floor(Math.random() * max) + min
    }

}


let on_load = () => {

    // TODO gui setters.
    let SPEED = HTMLMenu.getAgentSpeed();

    let game = new Game();
    HTMLMenu.setup(game);

    let qlearning = new QLearning(4);
    let state: any = null;

    let await_game_then_start = (agent_loop: any) => {
        let me = setInterval(function() {
            state = game.reset();

            if(state !== null){
                agent_loop();
                clearInterval(me);
            }
        }, 100);
        return me;
    };

    let agent_loop = (agent: any) => {

        let me = setInterval(function() {

            let action = agent.predict(state);

            let data = game.step(action);
            if(data !== null && !data.t){

                let {s, a, r, s1, t} = data;

                agent.learn(s, a, r, s1, t);


                // Draw statistics
                game.cellOverlay({
                    s: s,
                    data: agent.Q[s]
                });

                state = s1;

            } else {
                // Restart setup loop
                await_game_then_start(
                    agent_loop.bind(null, qlearning)
                );
                clearInterval(me);

            }

        }, SPEED);
    };

    // Wait for game to start
    if(HTMLMenu.getAgentEnabled()){
        await_game_then_start(
            agent_loop.bind(null, qlearning)
        );
    }



};



window.onload = on_load;



