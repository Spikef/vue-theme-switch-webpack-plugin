<template>
  <div id="app">
    <header>
      <nav>
        <span class="brand">Example</span>
        <ul class="menu">
          <li class="menu-item">
            <span style="background-color: #409eff" @click="$theme='default'"></span>
          </li>
          <li class="menu-item">
            <span style="background-color: #5cb85c" @click="$theme='light'"></span>
          </li>
          <li class="menu-item">
            <span style="background-color: #8183e2" @click="$theme='dark'"></span>
          </li>
        </ul>
      </nav>
      <div class="banner">
        <h1>Vue Theme Switcher</h1>
        <p>A webpack plugin to help you switch vue app theme.</p>
      </div>
    </header>
    <article>
      <router-view />
    </article>
    <footer>
      <p>Code &amp; design licensed under MIT.</p>
    </footer>
  </div>
</template>

<style lang="less">
  header {
    nav {
      padding: 8px 160px;
      &::after {
        content: '';
        display: table;
        clear: both;
      }
      .brand {
        float: left;
        color: #409eff;
        height: 48px;
        line-height: 48px;
        font-size: 24px;
        font-family: "Helvetica Neue", "PingFang SC", "Microsoft YaHei", sans-serif;
        font-weight: bolder;
      }
      .menu {
        float: right;
        &-item {
          float: left;
          padding: 8px 0 8px 16px;
          span {
            width: 32px;
            height: 32px;
            display: inline-block;
            border-radius: 4px;
            cursor: pointer;
          }
        }
      }
    }
    .banner {
      background: #409eff;
      box-shadow: inset 0 8px 8px -8px rgba(0,0,0,.2), inset 0 -8px 8px -8px rgba(0,0,0,.2);
      color: #fff;
      padding: 28px;
      text-align: center;
    }
  }

  article {
    height: calc(100% - 258px);
    box-sizing: border-box;
    padding: 40px 160px;
  }

  footer {
    background: #f3f3f3;
    padding: 16px 0;
    position: fixed;
    bottom: 0;
    width: 100%;
    text-align: center;
    font-size: 12px;
    color: #bbb;
    font-weight: 300;
  }
</style>

<style lang="less" theme="light">
  header {
    nav {
      .brand {
        color: #5cb85c;
      }
    }
    .banner {
      background: #5cb85c;
      box-shadow: inset 0 8px 8px -8px rgba(0,0,0,.3), inset 0 -8px 8px -8px rgba(0,0,0,.3);
    }
  }
</style>

<style lang="less" theme="dark">
  header {
    nav {
      background-color: #262990;

      .brand {
        color: #8183e2;
      }
    }
    .banner {
      background-color: #222222;
    }
  }

  article {
    background-color: #333333;
  }

  footer {
    color: #c9c9c9;
    background-color: #262990;
  }
</style>
