/*タイトルシーン作成*/
var TitleScene = cc.Scene.extend({
    onEnter: function () {
        this._super();

        //本体レイヤー
        this.addChild(new mainLayer());

    },
});

/*タイトルシーン・メインレイヤー*/
var mainLayer = cc.Layer.extend({
	size : null,	//ウィンドウサイズ読み込み
	bg : null,	//背景スプライト
	ground : null, 	//地表スプライト
	time : 0,	//タイマー
    ctor: function () {
        this._super();

        //Get screensize
        this.size = cc.winSize;

        //////////////////////////////
        //Make sprite
        //////////////////////////////
        //背景関係
        //bg
        this.bg = cc.Sprite.create(res.tt_backlooppic);
        this.bg.setPosition(this.size.width / 2 + this.bg.getBoundingBox().width / 4,this.size.height / 2 + 1);
        this.bg.setScale(1);
        this.addChild(this.bg, -101);
        //ground
        this.ground = cc.Sprite.create(res.tt_groundlooppic);
        this.ground.setPosition(this.size.width / 2 + this.ground.getBoundingBox().width / 4,this.size.height / 2);
        this.ground.setScale(0.5);
        this.addChild(this.ground, -100);
        //ゲーム本体
        //こんぷちゃん
        var comp = cc.Sprite.create(res.wz_jump2);
        comp.setPosition(this.size.width / 2,this.size.height / 2 - 70);
        comp.setScale(1);
        this.addChild(comp, 0);
        //Title
        var title = cc.Sprite.create(res.tt_titlepic);
        title.setPosition(this.size.width / 2 - 20,this.size.height / 2 + 80);
        title.setScale(1);
        this.addChild(title, 0);
        //push
        var push = cc.Sprite.create(res.tt_pushkeypic);
        push.setPosition(this.size.width / 2,this.size.height / 2);
        push.setScale(1);
        push.getTexture().setAliasTexParameters();
        this.addChild(push, 0);
        //rights
        var right = cc.Sprite.create(res.tt_rightpic);
        right.setPosition(this.size.width / 2 + 133,this.size.height / 2 - 137);
        right.setScale(0.7);
        this.addChild(right, 0);
        //フレーム関係
        //frame
        var frame = cc.Sprite.create(res.fr_framepic);
        frame.setPosition(this.size.width / 2,this.size.height / 2);
        frame.setScale(0.5);
        this.addChild(frame, 100);
        //jumpbutton
        var jumpButton = cc.Sprite.create(res.fr_jumpbuttonpic);
        jumpButton.setPosition(53, 137);
        jumpButton.setScale(0.5);
        this.addChild(jumpButton, 101);
        //kickButton
        var kickButton = cc.Sprite.create(res.fr_kickbuttonpic);
        kickButton.setPosition(this.size.width - 53, 137);
        kickButton.setScale(0.5);
        this.addChild(kickButton, 101);

        //こんぷちゃんのアニメーション
        compAnimSingle = cc.Animate.create(this.tt_makeAnimation(res.wz_walk,76,96,2,0.1));
        compAnim = cc.RepeatForever.create(compAnimSingle);
        comp.runAction(compAnim);
        //pushのアニメーション
        pushAnimSingle = cc.Animate.create(this.tt_makeAnimation(res.tt_pushkeyanimpic,179,17,2,0.8));
        pushAnim = cc.RepeatForever.create(pushAnimSingle);
        push.runAction(pushAnim);

        //キーボードが押されるかタッチされるかで起動
        //Key board event
        cc.eventManager.addListener({
            event: cc.EventListener.KEYBOARD,

            onKeyPressed: function (keyCode, event) {
            	this.tt_startGame();
            }.bind(this),
        },this);
        //Touchscreen event
        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,

            onTouchBegan: function (touch, event) {
            	this.tt_startGame();
            }.bind(this),
        },this);

        this.scheduleUpdate();
    },

    update : function(){
    	this.time += 1;

    	//背景画像をスクロール
    	//基本位置との差を求める
    	var bgdev = this.time % (this.bg.getBoundingBox().width / 2);
    	//移動
    	this.bg.setPosition(this.size.width / 2 + this.bg.getBoundingBox().width / 4 - bgdev,this.size.height / 2 + 1);
		
		//地面画像をスクロール
		//基本位置との差を求める
    	var gddev = this.time * 2 % (this.ground.getBoundingBox().width / 2);
    	//移動
    	this.ground.setPosition(this.size.width / 2 + this.ground.getBoundingBox().width / 4 - gddev,this.size.height / 2 + 1);

    },

    tt_makeAnimation : function(animimg,width,height,count,delay){

    	//返すアニメーションの作成
    	var anim = cc.Animation.create();

    	//コマをアニメーションに取り込み
    	for(var i=0;i<count;i++){

    		var newframe;	//新規フレーム

    		var cutter;	//元画像を四角形に切り抜くrect
    		cutter = cc.rect( width*i , 0 , width , height );

    		//切り抜き
    		newframe = cc.SpriteFrame.create(animimg,cutter);

    		//アニメーションに追加
    		anim.addSpriteFrame(newframe);
    	}

    	//1コマの秒数
    	anim.setDelayPerUnit(delay);

    	return anim;
    },

    tt_startGame : function(){
    	cc.director.runScene(new GameScene());
    },
});

window.onload = function () {
    cc.game.onStart =  function () {
        cc.LoaderScene.preload(g_resources, gameMainSystem, this);
        //cc.view.setDesignResolutionSize(640, 360, cc.ResolutionPolicy.FIXED_WIDTH);
        
    };
    cc.game.run("gameCanvas");
  
};


function gameMainSystem() {
    cc.director.runScene(new TitleScene());
}