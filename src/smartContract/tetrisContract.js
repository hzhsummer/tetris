'use strict';

var Gamer = function(item) {
    if (item) {
        var obj = JSON.parse(item);
        this.author = obj.author;
        this.nickName = obj.nickName
        this.score = obj.score;
        this.createDate = obj.createDate;
    } else {
        this.author = "";
        this.nickName = "";
        this.score = 0;
        this.createDate = "";
    }
};

Gamer.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};


var TetrisContract = function() {
    LocalContractStorage.defineProperty(this, "size");
    LocalContractStorage.defineMapProperty(this, "rankingList", {
        parse: function(item) {
            return new Gamer(item);
        },
        stringify: function(obj) {
            return obj.toString();
        }
    });
};



TetrisContract.prototype = {
    init: function() {
      this.size = 0;
    },
    toString: function() {
        return JSON.stringify(this);
    },
    /*保存玩家数据到链上*/
    save: function(nickName, score) {
        // 自动获取当前钱包检测到的登录钱包地址
        var from = Blockchain.transaction.from;


        var hasGamer;

        for(var i=0; i<this.size; i++){
          var tempObj = JSON.parse(this.rankingList.get(i));
          if (tempObj.author === from) {
            this.rankingList.del(i);
            this.size --;

            hasGamer = new Gamer();

            hasGamer.author = from;
            hasGamer.nickName = nickName;
            hasGamer.score = score;
            hasGamer.createDate = Blockchain.transaction.timestamp * 1000;

            this.rankingList.put(this.size, hasGamer);
            this.size ++;
          }
        }

        if (!hasGamer) {

          var item = new Gamer();
          item.author = from;
          item.nickName = nickName;
          item.score = score;
          item.createDate = Blockchain.transaction.timestamp * 1000;


          this.rankingList.put(this.size, item);

          this.size ++;
        }
    },
    /*获取排行榜列表*/
    getRankingList: function() {
      var from = Blockchain.transaction.from;
      var list = [];

      for(var i=0; i<this.size; i++){
        var tempObj = JSON.parse(this.rankingList.get(i));
        list.push(tempObj);
      }

      return list;
    },
    /*获取链上用户分数*/
    getGamerScore: function() {
      var from = Blockchain.transaction.from;

      var currGamer;

      for(var i=0; i<this.size; i++){
        var tempObj = JSON.parse(this.rankingList.get(i));
        if (tempObj.author === from) {
          currGamer = tempObj;
        }
      }

      if (currGamer) {
        return currGamer;
      } else {
        return 'no data';
      }
    }
};

module.exports = TetrisContract;
