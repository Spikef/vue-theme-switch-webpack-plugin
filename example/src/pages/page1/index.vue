<template>
  <div id="page1">
    <el-form
      ref="form"
      :model="form"
      label-width="80px"
      style="width: 560px; margin: 0 auto;"
    >
      <el-form-item label="活动名称">
        <el-input v-model="form.name" />
      </el-form-item>
      <el-form-item label="活动区域">
        <el-select
          v-model="form.region"
          placeholder="请选择活动区域"
        >
          <el-option
            label="区域一"
            value="shanghai"
          />
          <el-option
            label="区域二"
            value="beijing"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="活动时间">
        <el-col :span="11">
          <el-date-picker
            v-model="form.date1"
            type="date"
            placeholder="选择日期"
            style="width: 100%;"
          />
        </el-col>
        <el-col
          class="line"
          :span="2"
          :style="lineStyle"
        >
          -
        </el-col>
        <el-col :span="11">
          <el-time-picker
            v-model="form.date2"
            placeholder="选择时间"
            style="width: 100%;"
          />
        </el-col>
      </el-form-item>
      <el-form-item label="即时配送">
        <el-switch v-model="form.delivery" />
      </el-form-item>
      <el-form-item label="活动性质">
        <el-checkbox-group v-model="form.type">
          <el-checkbox
            label="美食/餐厅线上活动"
            name="type"
          />
          <el-checkbox
            label="地推活动"
            name="type"
          />
          <el-checkbox
            label="线下主题活动"
            name="type"
          />
          <el-checkbox
            label="单纯品牌曝光"
            name="type"
          />
        </el-checkbox-group>
      </el-form-item>
      <el-form-item label="特殊资源">
        <el-radio-group v-model="form.resource">
          <el-radio label="线上品牌商赞助" />
          <el-radio label="线下场地免费" />
        </el-radio-group>
      </el-form-item>
      <el-form-item label="活动形式">
        <el-input
          v-model="form.desc"
          type="textarea"
        />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          @click="onSubmit"
        >
          立即创建
        </el-button>
        <el-button>取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      form: {
        name: '',
        region: '',
        date1: '',
        date2: '',
        delivery: false,
        type: [],
        resource: '',
        desc: '',
      },
    };
  },
  computed: {
    lineStyle() {
      let color;
      // eslint-disable-next-line default-case
      switch (this.$theme) {
        case 'dark':
          color = '#C0C4CC';
          break;
        case 'light':
        default:
          color = '#000000';
          break;
      }

      return { color };
    },
  },
  methods: {
    onSubmit() {
      this.$message('提交成功!');
      setTimeout(() => {
        this.$router.push('/page2');
      }, 2000);
    },
  },
};
</script>

<style lang="less">
  #page1 {
    .el-select .el-input {
      width: 380px
    }

    .el-form {
      width: 460px
    }

    .line {
      text-align: center
    }

    .el-checkbox-group {
      width: 320px;
      margin: 0;
      padding: 0;
      list-style: none
    }

    .el-checkbox-group:after,.el-checkbox-group:before {
      content: " ";
      display: table
    }

    .el-checkbox-group:after {
      clear: both;
      visibility: hidden;
      font-size: 0;
      height: 0
    }

    .el-checkbox-group .el-checkbox {
      float: left;
      width: 160px;
      margin: 0;
      padding: 0
    }

    .el-checkbox-group .el-checkbox+.el-checkbox {
      margin-left: 0
    }

    .demo-form-normal {
      width: 460px
    }

    .demo-form-inline {
      width: auto
    }

    .demo-form-inline .el-input {
      width: 150px
    }

    .demo-form-inline>* {
      margin-right: 10px
    }

    .demo-ruleForm {
      width: 460px
    }

    .demo-ruleForm .el-select .el-input {
      width: 360px
    }

    .demo-dynamic .el-input {
      margin-right: 10px;
      width: 270px;
      vertical-align: top
    }

    .fr {
      float: right
    }
  }
</style>

<style lang="less" theme="red">
    #page1 {
        .content {
            color: #bd410b;
        }
    }
</style>
