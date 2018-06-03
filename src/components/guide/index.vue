<template>
  <div v-show="!isMobile">
    <!-- <div class="login-box">
      <img class="logo" src="../../assets/logo.png">
    </div> -->
    <div class="guide right">
      <div class="up">
        <em style="transform:translate(0,-3px) scale(1,2)" />
      </div>
      <div class="left">
        <em style="transform:translate(-7px,3px) rotate(-90deg) scale(1,2)" />
      </div>
      <div class="down">
        <em style="transform: translate(0,9px) rotate(180deg) scale(1,2)" />
      </div>
      <div class="right">
        <em style="transform: translate(7px,3px)rotate(90deg) scale(1,2)" />
      </div>
    </div>
    <div class="guide left">
       <p class="instructions">
        游戏说明：<br/><br/>
        <span class="item">
          1、本游戏部分操作需要星云钱包插件支持！<a href="https://github.com/ChengOrangeJu/WebExtensionWallet" target="_blank" class="install" title="WebExtensionWallet">点击安装</a><br/>
          2、成绩上链基于星云链，去中心化，信息及算法公开透明<br/>
          3、手机扫码玩，重新找回童年游戏机的体验<br/>
          4、电脑玩，空格键、上下左右键无缝接入<br/>
          5、希望能勾起70~80后的童年回忆<br/>

        </span>
       </p>
      <div class="space">SPACE</div>
    </div>
    <div class="guide qr">
      <img :src="QRSrc" v-bind="{title:QRTitle,alt:QRCode}" />
      <span class="tips" v-html="QRTitle"></span>
    </div>
    <!--查看排行榜，上链-->
    <div class="guide opreate">
      <el-button type="danger" @click="inputNickName">上链</el-button>
      <el-button type="warning" @click="showRanking">排行榜</el-button>

      <p class="ranking">
        当前玩家: <br/><br/>
        {{gamerAddress}}
      </p>
    </div>

    <el-dialog title="排行榜" :visible.sync="dialogRankingInfoVisible" width="140%" :modal="false">
      <el-table :data="rankingList">
        <el-table-column type="index" label="排名" width="80"></el-table-column>
        <el-table-column property="nickName" label="昵称" width="150"></el-table-column>
        <el-table-column property="author" label="玩家地址" width="350"></el-table-column>
        <el-table-column property="score" label="分数" width="150"></el-table-column>
        <el-table-column label="时间" align="">
        <template slot-scope="scope">
          <i class="el-icon-time"></i>
          <span>{{scope.row.createDate | parseTime('{m}/{d} {h}:{i}')}}</span>
        </template>
        </el-table-column>
      </el-table>
    </el-dialog>

  </div>
</template>

<script src="./index.js">
</script>

<style lang="less">
  @import './index.less';
  .el-dialog{
    width: 140%;
    margin-top: 15vh;
    z-index: 999999;
    position: fixed;
    margin-left: -20%;
  }
</style>
