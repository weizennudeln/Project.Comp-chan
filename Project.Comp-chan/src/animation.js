﻿//定数
/*全般編*/
const wz_comp_chan_xPos = 280;                  // CoMPちゃんのx座標
const wz_groundPos = 80;                        // 地面の高さ
const wz_goal_distance = 10000;				 // ゴールまでの距離
const wz_nouki_first_distance = 500;            // 納期の初期距離
const wz_nouki_height_margin = 40;              // 納期の導火線の長さ(画像の縦幅/2と球部分の半径の差)
const wz_dash_speed = 150;                      // CoMPちゃんのダッシュ速度(初期値)
const wz_approach_speed = 155;                  // 納期の転がる速度(初期値)
const wz_item_num = 50;                         // 進捗1周期分のアイテム数
const wz_danger_margin = 0.03;                  // 進捗危機の判定ライン(1.0でスタートからゴールまでの距離)
const wz_item_pop_interval = 0.03;                 // アイテム出現間隔(進捗)
const wz_item_pop_probability = 0.8;            // アイテム出現率
const wz_danger_item_probability = 0.01;        // 納期危機のアイテム出現判定発生率(毎フレーム毎の判定なので低め推奨？)
const wz_item_hover_yPos = 230;                 // 空中アイテムの高さ
const wz_nouki_firstPos = -50;                  // 納期の初期x座標
const wz_nouki_speedup_interval = 10;           // 納期の時間経過による加速の頻度(s)
const wz_nouki_speedup_value = 10;              // 納期の時間経過による加速量

/*アクション編*/
const wz_kick_maxEnergy = 600;                  // キックの最大飛距離
const wz_jumpTime = 1.0;                        // ジャンプの滞空時間
const wz_jumpHeight = 140;                      // ジャンプの高さ
const wz_landingTime = 0.0;                     // ジャンプ後の硬直
const wz_chrge_delay = 0.3;                     // チャージ前の減速時間
const wz_kick_time = 0.5;                       // キックの滞空時間(実質の判定時間)
const wz_kick_moveX = 80;                       // キックで移動する量
const wz_kick_hight = 30;                       // キックの飛び上がり量
const wz_kick_landing_time = 0.5                // キックの硬直時間
const wz_kick_return_time = 0.5;                // キックの着地点から元に戻るまでの時間
const wz_damaged_time = 0.6;                    // ハードルにぶつかったときのダメージ時間

var wz_item_id = {
    goal: 0,
    nouki: 1,
    hurdle: 2,
    hyakuen: 3,
    juen: 3.5,
    gohyakuen: 4,
    gojuen: 4.5,
    yukichi: 5,
    shigenobu: 5.5,
    enadori: 6,
    deathdori: 6.5,
    konbu: 7,
    test: 7.5,
};
var wz_item_id_array = [
    wz_item_id.goal,
 wz_item_id.nouki,
 wz_item_id.hurdle,
 wz_item_id.hyakuen,
 wz_item_id.juen,
 wz_item_id.gohyakuen,
    wz_item_id.gojuen,
 wz_item_id.yukichi,
 wz_item_id.shigenobu,
   wz_item_id.enadori,
   wz_item_id.deathdori,
  wz_item_id.konbu,
  wz_item_id.test,
];
for (var i in wz_item_id) wz_item_id_array.push(wz_item_id[i]);
if (typeof wz_actiontype == "undefined") {
    var wz_actiontype = {};
    wz_actiontype.run = 0;
    wz_actiontype.jump = 1;
    wz_actiontype.jump2 = 2;
    wz_actiontype.charge = 3;
    wz_actiontype.kick = 4;
    wz_actiontype.kick2 = 5;
    wz_actiontype.kick3 = 7;
    wz_actiontype.damaged = 6;
};

/*オブジェクトデータ格納体*/
var object = function () {
    this.sprite = null;
    this.id = 0;
};
/*CoMPちゃんのアニメーション*/
var comp_animation = function () {
    this.walk = null;
    this.jump = null;
    this.jump2 = null;
    this.friction = null;
    this.charge = null;
    this.kick = null;
    this.kick2 = null;
    this.damage = null; //originally this.damaged. Changed to unify name
};
var animationLayer = cc.Layer.extend({
    comp_chan: null, // CoMPちゃんの物理データ
    comp_anime: null,
    items: [],
    nouki: null,
    action_end: null, //nowActionをrunに戻すアクション
    anime_nouki_roll: null, //納期の転がるアニメーション
    comp_muteki: false, //納期を蹴り飛ばせると当たり判定的に無敵時間が必要
    nowAction: wz_actiontype.run,
    progress: 0, //進捗(÷wz_goal_distance=ゴールまでの距離)
    speed: wz_dash_speed,
    nouki_speed: wz_approach_speed,
    kick_power: 0,
    progress_itempop: 0,
    time_speedup: 0,
    isGameRun:true,
    init: function () {
        this._super();
        /*CoMPちゃんのデータを生成*/
        this.comp_chan = new object();

        var size = cc.director.getWinSize();
        this.comp_chan.sprite = new cc.Sprite.create(res.wz_walk);
        //wz_scaling(this.comp_chan.sprite, this.comp_chan.sprite.getBoundingBox().width / 2, this.comp_chan.sprite.getBoundingBox().height / 2);
        this.comp_chan.id = wz_item_id.comp_chan;
        this.comp_chan.sprite.setPosition(wz_comp_chan_xPos, wz_groundPos + 96 / 2);

  
        /*納期生成*/
        this.nouki = new object();
        this.nouki.sprite = wz_getItemSprite(wz_item_id.nouki);
        //wz_scaling(this.nouki.sprite, this.nouki.sprite.getBoundingBox().width / 2, this.nouki.sprite.getBoundingBox().height / 2);

        this.nouki.id = wz_item_id.dead;
        var nouki_hight = this.nouki.sprite.getBoundingBox().height - wz_nouki_height_margin;
        this.nouki.sprite.setPosition(wz_nouki_firstPos, wz_groundPos + nouki_hight / 2);
  
        /*アニメーション構築*/
        this.comp_anime = new comp_animation();

        var animdata = {'walk':{width:76,height:96,turn_point:2,count:2,delay_time:1/8,image_path:res.wz_walk},'jump':{width:64,height:96,turn_point:2,count:2,delay_time:wz_jumpTime/2,image_path:res.wz_jump},'jump2':{width:56,height:96,turn_point:1,count:1,delay_time:wz_landingTime,image_path:res.wz_jump2},'friction':{width:84,height:92,turn_point:3,count:3,delay_time:wz_chrge_delay/3,image_path:res.wz_friction},'charge':{width:48,height:92,turn_point:2,count:2,delay_time:1/4,image_path:res.wz_charge},'kick':{width:89,height:116,turn_point:3,count:3,delay_time:wz_kick_time/3,image_path:res.wz_kick},'kick2':{width:85,height:92,turn_point:6,count:6,delay_time:wz_kick_landing_time/6,image_path:res.wz_kick2},'damage':{width:152,height:127,turn_point:7,count:7,delay_time:wz_damaged_time/7,image_path:res.wz_damaged},'nouki':{width:264,height:256,turn_point:8,count:8,delay_time:1/16,image_path:res.wz_nouki}}
        var len = Object.keys(animdata).length;
        var animvars = [];
        var anim_cache = cc.animationCache;
        var vnames = ['walk', 'jump', 'jump2', 'friction', 'charge', 'kick', 'kick2', 'damage','nouki'];
        for (var k in animdata)
        {
            wz_loadAnimation(k, animdata[k].width, animdata[k].height, animdata[k].turn_point, animdata[k].count, animdata[k].delay_time, animdata[k].image_path, anim_cache);
            animvars.push(anim_cache.getAnimation(k));
            animvars[animvars.length - 1].setRestoreOriginalFrame(true);
            this.comp_anime[k] = cc.Animate.create(animvars[animvars.length - 1]);
        }
        this.anime_nouki_roll = this.comp_anime['nouki']; //exceptional variable

        //this.initItems();
        //console.log("アイテム" + this.items.length + "個");
  
        /*アクションの設定*/
        this.action_end = cc.callFunc(function () {
            this.endOfAction();
        }.bind(this), this.comp_chan.sprite);

        this.comp_chan.sprite.runAction(cc.repeat(this.comp_anime.walk, Math.pow(2, 30)));
        this.nouki.sprite.runAction(cc.repeat(this.anime_nouki_roll, Math.pow(2, 30)));
        this.nouki.sprite.runAction(this.action_approach());
        
        this.addChild(this.nouki.sprite);

  
        this.addChild(this.comp_chan.sprite);             // レイヤーにはスプライトを渡す

        this.scheduleUpdate();

        //console.log("初期化終了");
    },
    ctor: function () {
        this._super();
        this.init();
    },
    update: function (dt) {
        if (this.isGameRun == false) return;

        /*アイテム当たり判定*/
        var comp_rect = this.comp_chan.sprite.getBoundingBox();

        for (var i in this.items) {
            var itemContentSize = this.items[i].sprite.getBoundingBox();
            if (cc.rectIntersectsRect(itemContentSize, comp_rect)) {
                var id = this.items[i].id;

                /*ハードルだったらジャンプ判定後アニメーション更新*/
                if (id == wz_item_id.hurdle) {
                    if (this.nowAction == wz_actiontype.run && this.comp_muteki == false) {
                        this.nowAction = wz_actiontype.damaged;
                        wz_hitItems(id);
                        this.removeChild(this.items[i].sprite);
                        this.items.splice(i, 1);

                        var damage = cc.delayTime(wz_damaged_time);
                        var endaction = cc.callFunc(function () {
                                this.endOfAction();
                        }.bind(this), this.comp_chan.sprite)

                        var approach = cc.moveBy(wz_damaged_time, this.nouki_speed * wz_damaged_time, 0); //硬直で納期の速度は速くなっているように見える
                        for (var i in this.items) {
                            this.items[i].sprite.stopAllActions();
                        }


                        this.nouki.sprite.stopAllActions();
                        this.nouki.sprite.runAction(cc.repeat(this.anime_nouki_roll, Math.pow(2, 30)));
                        this.nouki.sprite.runAction(cc.sequence(approach, cc.repeat(this.action_approach(), Math.pow(2, 30))));

                        this.comp_chan.sprite.stopAllActions();
                        this.comp_chan.sprite.runAction(cc.sequence(this.comp_anime.damage, cc.repeat(this.comp_anime.walk, Math.pow(2, 30))));
                        this.comp_chan.sprite.runAction(cc.sequence(damage, endaction));


                    }

                }
                else {
                    wz_hitItems(id);
                    this.removeChild(this.items[i].sprite);
                    this.items.splice(i, 1);
                }
            }
        }

        /*アイテム発生判定*/
        if (this.getProgress() - this.progress_itempop >= wz_item_pop_interval) {
            this.progress_itempop = this.getProgress();
            /*納期危機中、止まってる間はこっちはオフ*/
            if(wz_item_pop_probability >= Math.random() && this.getDeadLine() > wz_danger_margin && this.getIsScrollingBackGround()){
                console.log("通常のアイテム発生");
                var item = new object();

                /*アイテム出現座標*/
                var x = 600;
                x += wz_comp_chan_xPos;
                x += Math.random() * 400 - 200;
                
                var item_id = wz_getItemIdFromProbability();
                item.sprite = wz_getItemSprite(item_id);
                item.id = item_id;

                /*ここは共通なので*/
                if (item_id == wz_item_id.hurdle) {
                    /*ハードルは地面固定*/
                    var y = wz_groundPos + item.sprite.getBoundingBox().height / 2;
                    item.sprite.setPosition(x, y);
                }
                else {
                    var r = Math.random();
                    if (r * 2 >= 1) {
                        /*地面にあるよ*/
                        var y = wz_groundPos + item.sprite.getBoundingBox().height / 2;
                        item.sprite.setPosition(x, y);
                    }
                    else {
                        /*空中にあるよ*/
                        item.sprite.setPosition(x, wz_item_hover_yPos);
                    }
                }

                //console.log(item);
                this.addChild(item.sprite);
                this.items.push(item);
            }
        }

        /*アイテム移動処理*/
        if (this.getIsScrollingBackGround())
            for (var i in this.items) {
                this.items[i].sprite.x -= this.speed * dt;
        }

        /*納期が迫ってたらアイテムを増やす*/
        if (this.getDeadLine() < wz_danger_margin) {
            if (Math.random() <= wz_danger_item_probability) {
                console.log("納期危機によるアイテム発生");
                var item = new object();

                /*アイテム出現座標*/
                var x = 600;
                x += wz_comp_chan_xPos;
                x += Math.random() * 400 - 200;

                var item_id = wz_getItemIdFromProbability();
                //console.log("id " + item_id);
                item.sprite = wz_getItemSprite(item_id);
                item.id = item_id;

                /*ここは共通なので*/
                if (item_id == wz_item_id.hurdle) {
                    /*ハードルは地面固定*/
                    var y = wz_groundPos + item.sprite.getBoundingBox().height / 2;
                    item.sprite.setPosition(x, y);
                }
                else {
                    var r = Math.random();
                    if (r * 2 >= 1) {
                        /*地面にあるよ*/
                        var y = wz_groundPos + item.sprite.getBoundingBox().height / 2;
                        item.sprite.setPosition(x, y);
                    }
                    else {
                        /*空中にあるよ*/
                        item.sprite.setPosition(x, wz_item_hover_yPos);
                    }
                }
                //console.log(item);
                this.addChild(item.sprite);
                this.items.push(item);
            }
        }

        /*納期との当たり判定*/
        var nouki_rect = this.nouki.sprite.getBoundingBox();
        /*導火線は当たり判定から除外する*/
        nouki_rect.width -= wz_nouki_height_margin;
        nouki_rect.height -= wz_nouki_height_margin;
        if (cc.rectIntersectsRect(nouki_rect, comp_rect)) {
            if (this.nowAction == wz_actiontype.kick) {
                /*蹴り判定成功*/
                console.log("「あっちいけぇ～！」");
                this.comp_muteki = true;
                /*納期の動き*/
                var fly = cc.moveBy(wz_kick_time + wz_kick_landing_time, -wz_kick_maxEnergy * this.kick_power, 0);

                }.bind(this), this.comp_chan.sprite);

                this.nouki.sprite.stopAllActions();
                this.nouki.sprite.runAction(cc.sequence(fly, cc.repeat(this.action_approach(),Math.pow(2,30))));
                this.nouki.sprite.runAction(cc.repeat(this.anime_nouki_roll, Math.pow(2, 30)));

                this.nowAction = wz_actiontype.kick3;
                

            }
            else if(this.comp_muteki == false) {
                wz_hitItems(wz_item_id.dead);
                console.log("「ぎゃ～！　納期が過ぎちゃった！」");
                this.isGameRun = false;
                this.reorderChild(this.nouki.sprite, 10); //納期を前に置く

                var anim_cache = cc.animationCache;
                wz_loadAnimation("exp", 384, 414, 12, 9, 1 / 12, res.wz_explosion, anim_cache);
                var exp = anim_cache.getAnimation("exp");
                exp.setRestoreOriginalFrame(true);
                var anime = cc.Animate.create(exp);
                var compdeath = cc.callFunc(function () {
                    var p = this.comp_chan.sprite;
                    var d = new cc.Sprite.create(res.wz_death);
                    d.setPosition(p.x,p.y);
                    this.removeChild(this.comp_chan.sprite);
                    this.addChild(d, 0);

                    this.removeChild(this.nouki.sprite);
                }.bind(this), this.nouki.sprite);

                this.nouki.sprite.stopAllActions();
                this.nouki.sprite.runAction(cc.sequence(anime, compdeath));

                //ゲームオーバーイベント
                this.scheduleOnce(this.gameover, 3);
            }
        }

        /*進捗を生みます*/
        switch (this.nowAction) {
            case wz_actiontype.run: case wz_actiontype.jump:
                this.progress += wz_dash_speed * dt;
                break;
        }

        /*納期加速*/
        this.time_speedup += dt;
        if (this.time_speedup >= wz_nouki_speedup_interval && this.getIsScrollingBackGround()) {
            console.log("「上司の無茶な指示が……」");
            this.time_speedup -= wz_nouki_speedup_interval;
            this.nouki_speed += wz_nouki_speedup_value;

            this.nouki.sprite.stopAllActions();
            this.nouki.sprite.runAction(cc.repeat(this.anime_nouki_roll, Math.pow(2, 30)));
            this.nouki.sprite.runAction(cc.repeat(this.action_approach(), Math.pow(2, 30)));
        }
        if (this.nouki_speed < this.speed && this.getDeadLine() >= wz_danger_margin) {
            
            this.nouki_speed = this.speed;
        }

    },
    /*ジャンプの処理*/
    WhenJumpButtonDown: function () {
        if (this.isGameRun == false) return;
        if (this.nowAction == wz_actiontype.run && this.comp_muteki == false) {
            this.nowAction = wz_actiontype.jump;
            var jump = cc.jumpBy(wz_jumpTime, 0.0, 0.0, wz_jumpHeight, wz_jumpTime);
            var before_landing = cc.callFunc(function () {
                this.nowAction = wz_actiontype.jump2;
                var approach = cc.moveBy(wz_landingTime, this.nouki_speed * wz_landingTime, 0); //着地硬直で納期の速度は速くなっているように見える
                this.nouki.sprite.stopAllActions();
                this.nouki.sprite.runAction(cc.sequence(approach, this.action_approach()));
                this.nouki.sprite.runAction(cc.repeat(this.anime_nouki_roll, Math.pow(2, 30)));

            }.bind(this), this.comp_chan.sprite);
            var landing = cc.delayTime(wz_landingTime)
            var walk = cc.repeat(this.comp_anime.walk, Math.pow(2, 30));

            this.comp_chan.sprite.stopAllActions();
            this.comp_chan.sprite.runAction(cc.sequence(this.comp_anime.jump, this.comp_anime.jump2, walk)); //アニメの動き
            this.comp_chan.sprite.runAction(cc.sequence(jump, before_landing, landing, this.action_end)); //座標の動きと諸々
        }
    },
    /*蹴り溜め中の処理*/
    WhenKickButtonDown: function () {
        if (this.isGameRun == false) return;
        if (this.nowAction == wz_actiontype.run && this.comp_muteki == false) {
            console.log("「納期が近づいてきた……蹴らなきゃ……」");
            this.nowAction = wz_actiontype.charge;

            /*納期とすべてのアイテムのCoMPちゃんによる移動を停止*/
            this.nouki.sprite.stopAllActions();
            var approach = cc.moveBy(1.0, this.nouki_speed, 0); //硬直で納期の速度は速くなっているように見える
            this.nouki.sprite.runAction(cc.repeat(approach, Math.pow(2, 30)));
            this.nouki.sprite.runAction(cc.repeat(this.anime_nouki_roll, Math.pow(2, 30)));

            this.comp_chan.sprite.stopAllActions();
            this.comp_chan.sprite.runAction(cc.sequence(this.comp_anime.friction, cc.repeat(this.comp_anime.charge, Math.pow(2, 30))));
            //this.comp_chan.sprite.runAction(this.comp_anime.friction);
        }
    },
    /*蹴る処理*/
    WhenKickButtonUp: function (power) {
        if (this.isGameRun == false) return;
        if (this.nowAction == wz_actiontype.charge) {
            //console.log(power);
            this.nowAction = wz_actiontype.kick;
            this.kick_power = power;

            /*CoMPちゃんの動き*/
            var kick = cc.jumpBy(wz_kick_time, -wz_kick_moveX, 0, wz_kick_hight, 1);
            var kick_landing = cc.delayTime(wz_kick_landing_time);
            var kick_return = cc.moveBy(wz_kick_return_time, wz_kick_moveX, 0);

            var before_landing = cc.callFunc(function () {
                /*蹴り判定終了*/
                this.nowAction = wz_actiontype.kick2;
            }.bind(this), this.comp_chan.sprite);
            var after_landing = cc.callFunc(function () {
		this.nowAction = wz_actiontype.run;
		this.comp_muteki = false;
            }.bind(this), this.comp_chan.sprite)

            this.comp_chan.sprite.stopAllActions();
            this.comp_chan.sprite.runAction(cc.sequence(kick, before_landing, kick_landing, kick_return, after_landing)); //座標の動きと諸々
            this.comp_chan.sprite.runAction(cc.sequence(this.comp_anime.kick, this.comp_anime.kick2, cc.repeat(this.comp_anime.walk, Math.pow(2, 30))));


            return true;
            //console.log("パワー" + this.kick_power + "で蹴ったよ");
        }
        else return false;
    },
    endOfAction: function () {
        this.nowAction = wz_actiontype.run;
    },
    /*進捗どうですか*/
    getProgress: function() {
        return this.progress / wz_goal_distance;
    },
    getDeadLine: function(){
        return (this.comp_chan.sprite.getBoundingBox().x - this.nouki.sprite.getBoundingBox().x) / wz_goal_distance;
    },
    /*変速*/
    accelaration: function (ds) {
        if (this.isGameRun == false && this.getIsScrollingBackGround()) return;
        this.speed += ds;

        this.nouki.sprite.stopAllActions();
        this.nouki.sprite.runAction(cc.repeat(this.anime_nouki_roll, Math.pow(2, 30)));
        this.nouki.sprite.runAction(cc.repeat(this.action_approach(), Math.pow(2, 30)));
    },

    /*アクション*/
    action_itemMove: function () { // CoMPちゃんのダッシュ速度に合わせて相対的に移動する
        return new cc.repeat(cc.moveBy(1.0, -this.speed, 0), Math.pow(2, 30));
    },
    action_approach: function () { // 納期の接近
        return new cc.repeat(cc.moveBy(1.0, this.nouki_speed - this.speed, 0), Math.pow(2, 30));
    },

    /*背景スクロール用*/
    getIsScrollingBackGround: function () {
        if (this.isGameRun == false) return false;
        if(this.nowAction == wz_actiontype.run ||this.nowAction ==  wz_actiontype.jump){
            if (this.comp_muteki == false) {
                return true;
            }
        }
        return false;
    },
    getDushSpeed: function(){
        return this.speed;
    },
    gameover: function () {
        //gameoverレイヤー呼び出し
        cc.director.getRunningScene().addChild(new goLayer(), 20);
    },
});

/*背景とかを動かします*/
var backgroundLayer = cc.Layer.extend({
    back: null,
    ground: null,
    back2: null,
    ground2: null,
    ctor: function () {
        this._super();
        this.init();
    },
    init: function () {
        this.back = new cc.Sprite(res.tt_backlooppic);
        this.back2 = new cc.Sprite(res.tt_backlooppic);
        this.ground = new cc.Sprite(res.tt_groundlooppic);
        this.ground2 = new cc.Sprite(res.tt_groundlooppic);
        var size = cc.winSize;

        this.ground.setScale(0.5);
        this.ground2.setScale(0.5);


        this.ground.setPosition(0, 180);
        this.ground2.setPosition(this.ground2.getBoundingBox().width, 180);

        this.back.setPosition(0, size.height/2);
        this.back2.setPosition(this.back.getBoundingBox().width, size.height / 2);


        this.addChild(this.back);
        this.addChild(this.back2);
        this.addChild(this.ground);
        this.addChild(this.ground2);

        this.scheduleUpdate();
    },
    update: function (dt) {
        if (layer_anime.getIsScrollingBackGround() == true) {
            /*地面をスクロール*/
            this.ground.x -= layer_anime.getDushSpeed() * dt;
            this.ground2.x -= layer_anime.getDushSpeed() * dt;

       
            var size = cc.director.getWinSize();
            if (this.ground.x + this.ground.getBoundingBox().width / 2 <= layer_anime.getDushSpeed() * dt) {
                this.ground.x += this.ground.getBoundingBox().width + size.width;
            }
            if (this.ground2.x + this.ground2.getBoundingBox().width / 2 <= layer_anime.getDushSpeed() * dt) {
                this.ground2.x += this.ground2.getBoundingBox().width + size.width;
            }

            /*背景スクロール*/
            this.back.x -= layer_anime.getDushSpeed() * dt / 2;
            this.back2.x -= layer_anime.getDushSpeed() * dt / 2;
            var size = cc.director.getWinSize();
            if (this.back.x + this.back.getBoundingBox().width / 2 < layer_anime.getDushSpeed() * dt / 2) {
                this.back.x = this.back.getBoundingBox().width/2;
				this.back2.x = this.back.getBoundingBox().width + this.back2.getBoundingBox().width/2;
            }
        }
    }
});

var wz_loadAnimation = function (animation_name, width, height, turn_point, count, delay_time, image_path, cache) {
    var x_count = 0;
    var y_count = 0;
    var frames_array = [];
    for (var i = 0; i < count; i++) {
        var current_x = width * x_count;
        var current_y = height * y_count;

        var frame = cc.SpriteFrame.create(
            image_path,
            cc.rect(current_x, current_y, width, height)
        );
        frames_array.push(frame);
       
        //if (i == 0) continue;
        if (turn_point == 1 || (i+1) % turn_point == 0) {
            x_count = 0;
            y_count++;
        }
        else {
            x_count++;
        }
    }

    var animation = cc.Animation.create(frames_array, delay_time);
    cache.addAnimation(animation, animation_name);
};
var call = function () { console.log("call"); }
var wz_scaling = function (sprite, width, height) {
    var size = sprite.getBoundingBox();
    sprite.setScale(width / size.width, height / size.height);
    //sprite.setContentSize(cc.size(width, height));
}
var wz_getItemSprite = function (id) {

    var sprites = {"0":res.wz_enadori,'1':res.wz_nouki,'2':res.wz_stop,'3':res.wz_hyakuen,'3.5':res.wz_juen,'4':res.wz_gohyakuen,'4.5':res.wz_gojuen,'5':res.wz_yukichi,'5.5':res.wz_shigenobu,"6": res.wz_enadori,'6.5':res.wz_deathdori,'7':res.wz_konbu,'7.5':res.wz_test};

    if (sprites[id]==undefined)
    {
        /*アイテム発生無し*/
            console.log("なにかがおかしいよ");
            return null; //result = null;//*/
    }

    result = new cc.Sprite.create(sprites[id]);
    wz_scaling(result, result.getBoundingBox().width / 2, result.getBoundingBox().height / 2);

    return result;
};

function wz_hitItems(id) {
    layer_ui.fr_hitItems(id);
}
function wz_getItemIdFromProbability() {
    var r = Math.random();
    for (var i = 2; i < wz_item_id_array.length; ++i) {
        r += layer_ui.fr_getItemFrequency(wz_item_id_array[i]);
        //console.log(wz_item_id_array[i] + " , " + layer_ui.fr_getItemFrequency(wz_item_id_array[i]));
        if (r >= 1) {
            //console.log("id " + wz_item_id_array[i]);
            return wz_item_id_array[i];
        }
    }
};
