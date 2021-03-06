var res =
    {
        wz_walk:            "res/walk.png",
        wz_jump:            "res/jump.png",
        wz_jump2:           "res/jumplanding.png",//着地
        wz_friction:        "res/friction.png",//キックの為の停止
        wz_charge:          "res/charge.png",
        wz_kick:            "res/kick_anime.png",
        wz_kick2:           "res/kicklanding.png",
        wz_damaged:         "res/damage.png",
        wz_nouki:           "res/nouki.png",
        wz_back:            "res/back.png",
        wz_test:            "res/test.png",
        wz_stop:            "res/stop.png",
        wz_enadori:         "res/enadori.png",
        wz_deathdori:       "res/deathdori.png",
        wz_hyakuen:         "res/100.png",
        wz_juen:            "res/-10.png",
        wz_gohyakuen:       "res/500.png",
        wz_gojuen:          "res/-50.png",
        wz_yukichi:         "res/10000.png",
        wz_shigenobu:       "res/-10000.png",
        wz_konbu:           "res/seaweed.png",
        wz_ground:          "res/ground.png",
        wz_enadori:         "res/enadori.png",
        wz_explosion:       "res/explosion.png",
        wz_death:           "res/death.png",

        fr_uibackpic:       "res/status.png",
        fr_jumpbuttonpic:   "res/jumpbutton.png",
        fr_kickbuttonpic:   "res/kickbutton.png",
        fr_framepic:        "res/frame.png",
        fr_lifepic:         "res/life_half.png", 
        fr_kickpic:         "res/kick.png", 
        fr_numberspic: 		"res/number.png", 

        tt_titlepic: 		"res/title.png",
        tt_pushkeypic:		"res/push.png",
        tt_pushkeyanimpic:	"res/push_anime.png",
        tt_rightpic: 		"res/right.png",
        tt_backlooppic: 	"res/backloop.png", 
        tt_groundlooppic: 	"res/groundloop.png", 

        go_screen:          "res/gameover.png",
        go_replay:          "res/replay.png", 
        go_tweet:           "res/tweet.png", 

    };
var g_resources =
    [
        res.wz_walk,
        res.wz_jump,
        res.wz_jump2,
        res.wz_nouki,
        res.wz_test,
        res.wz_enadori,
        res.wz_friction,
        res.wz_charge,
        res.wz_kick,
        res.wz_kick2,
        res.wz_damaged,
        res.wz_back,
        res.wz_test,
        res.wz_stop,
        res.wz_enadori,
        res.wz_deathdori,
        res.wz_hyakuen,
        res.wz_juen,
        res.wz_gohyakuen,
        res.wz_gojuen,
        res.wz_yukichi,
        res.wz_shigenobu,
        res.wz_konbu,
        res.wz_ground,
        res.wz_explosion,
        res.wz_death,

        res.fr_uibackpic,
        res.fr_jumpbuttonpic,
        res.fr_kickbuttonpic,
        res.fr_framepic,
        res.fr_lifepic,
        res.fr_kickpic,
        res.fr_numberspic,

        res.tt_rightpic,
        res.tt_pushkeypic,
        res.tt_titlepic,
        res.tt_pushkeyanimpic,
        res.tt_backlooppic,
        res.tt_groundlooppic,
        
        res.go_screen,
        res.go_replay,
        res.go_tweet,
    ];
for (var i in res) {
    g_resources.push(res[i]);
}


/*グローバル領域にそれぞれのレイヤーのポインタを格納します*/
/*通知関数のスコープ的にここにないとダメなので*/
var layer_anime = null;
var layer_ui = null;

var backGroundSceneLayer = cc.Layer.extend({
    ctor: function () {
        this._super();
        // 独自の処理をここに書く
        var size = cc.director.getWinSize();
        
        var sprite_bg = cc.Sprite.create(res.wz_back);
        sprite_bg.setPosition(size.width / 2, size.height / 2);
        sprite_bg.setScale(0.5);
        this.addChild(sprite_bg, 0);
        // init メソッドとは異なり
        // 最後は別に return を書かなくてよい
    }
});



/*通知関数の実装*/

//アイテムのヒットをお知らせします(1:納期 2:ゴール 3以降:アイテム)
function wz_hitItems(id)
{
    //layer_ui.hitItems(id);
}


/*Cocos2dゲーム本体*/
var GameScene = cc.Scene.extend({
    onEnter: function () {
        this._super();

        //背景レイヤー設定
        this.addChild(new backgroundLayer() , -10);

        //アニメーションレイヤー
        layer_anime = new animationLayer();
        this.addChild(layer_anime , 0);

        //UIレイヤー
        layer_ui = new uiLayer();
        this.addChild(layer_ui , 10);

    },

});