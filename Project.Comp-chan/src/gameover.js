/*ゲームオーバーレイヤー*/
var goLayer = cc.Layer.extend({
	size : null,	//ウィンドウサイズ読み込み
	score : 0,	//スコアの値をuiから読み取り
	ui_score:   [],	//スコア表示パラメータ 
    ctor: function () {
        this._super();

        //Get screensize
        this.size = cc.winSize;

        //////////////////////////////
        //Make sprite
        //////////////////////////////
        //フレーム関係
        //frame
        var goscreen = cc.Sprite.create(res.go_screen);
        goscreen.setPosition(this.size.width / 2,this.size.height / 2);
        goscreen.setScale(0.1);
        this.addChild(goscreen, 100);
        //「もう一度遊ぶ」ボタン
        var replaybutton = cc.Sprite.create(res.go_replay);
        replaybutton.setPosition(this.size.width / 2,this.size.height / 2);
        replaybutton.setScale(0.1);
        this.addChild(replaybutton, 100);
        //「ツイートする」ボタン
        var tweetbutton = cc.Sprite.create(res.go_tweet);
        tweetbutton.setPosition(this.size.width / 2,this.size.height / 2);
        tweetbutton.setScale(0.1);
        this.addChild(tweetbutton, 100);
        //スコア
        var s = layer_ui.score;
        for(var i=8;i>=0;i--){
        	this.ui_score[i] = cc.Sprite.create(res.fr_numberspic);
            this.ui_score[i].setPosition(this.size.width / 2 + (i - 4.5) * fr_NUIW / 2, this.size.height / 2 - 92);
            this.ui_score[i].setScale(0.5);
            this.ui_score[i].setVisible(false);
        	this.ui_score[i] = layer_ui.fr_getNumUI(this.ui_score[i],s%10);
        	s /= 10;
        	s = parseInt(s);
        	this.addChild(this.ui_score[i], 100);
        }

        //フレームが拡大していくアクション
        bindAction = cc.ScaleBy.create(0.2,10.0);
        goscreen.runAction(bindAction);

        //ボタンが移動するアクション
        rpbMoveAction = cc.MoveBy.create(0.2,79,27);
        //組み合わせる
        rpbAction = cc.Spawn.create(bindAction.clone(),rpbMoveAction,null);
        replaybutton.runAction(rpbAction);

        //ボタンが移動するアクション
        twtMoveAction = cc.MoveBy.create(0.2,79,-30);
        //組み合わせる
        twtAction = cc.Spawn.create(bindAction.clone(),twtMoveAction,null);
        tweetbutton.runAction(twtAction);

        //スコア表示用アクション
        scwaitAction = cc.DelayTime.create(0.2);
        scshowAction = cc.Show.create();
        scAction = cc.Sequence.create(scwaitAction,scshowAction);
        for(var i=8;i>=0;i--){
        	this.ui_score[i].runAction(scAction.clone());
        }

        //キーボードが押されるかタッチされるかで起動
        //Key board event
        cc.eventManager.addListener({
            event: cc.EventListener.KEYBOARD,

            onKeyPressed: function (keyCode, event) {
                
            }.bind(this),
        },this);
        //Touchscreen event
        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,

            onTouchBegan: function (touch, event) {
            	touchedPos = touch.getLocation();
                rpbArea = replaybutton.getBoundingBox();
                twtArea = tweetbutton.getBoundingBox();

                if (cc.rectContainsPoint(rpbArea, touchedPos)) {
                    //replay
                    this.replay();
                    return true;
                }else if(cc.rectContainsPoint(twtArea, touchedPos)){
                    //tweet
                    this.tweet();
                    return true;
                }else{
                    return false;
                }
            }.bind(this),
        },this);

        this.scheduleUpdate();
    },

    update : function(){
    	
    },

    replay : function(){
        cc.director.runScene(new TitleScene());
    },

    //ツイートシステム（参考：http://qiita.com/amoO_O/items/1135c4a652d04f9b8aa1様）
    tweet : function(){
        var query = [
            "original_referer=javascript:close",    //ツイート後にダイアログを閉じる
            "text=「のうきっく」で"+layer_ui.score+"点を取りました！ @CoMP_roductionより",  //つぶやく内容
            "url=http://comproduction.sakura.ne.jp/",  //つぶやきに付随するURL
        ],
        url = "https://twitter.com/intent/tweet?" + query.join("&"),
        target = "_blank",                          // ダイアログとして open
        opts = [
            "width=550",
            "height=420",
            "left=100",
            "top=100",
        ],                                          // ダイアログの大きさと位置
        option = opts.join(",");

        open(url, target, option);
    },
});