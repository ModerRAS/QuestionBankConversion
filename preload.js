const { writeFile } = require("fs");

const {
  GetName,
  WLDXReader,
  WLDX4Reader,
  MTBWriter,
  KSBWriter,
  EXCReader,
} = require("./lib");
const { TxtReader } = require("./TxtReader");

const TotalList = [
  {
    title: "网络大学=>磨题帮",
    description: "网络大学转磨题帮",
    keyword: "wldxmtb",
  },
  {
    title: "网络大学=>考试宝",
    description: "网络大学转考试宝",
    keyword: "wldxksb",
  },
  {
    title: "4列版网络大学=>考试宝",
    description: "4列版网络大学转考试宝",
    keyword: "wldxksb_short_4",
  },
  {
    title: "4列版网络大学=>磨题帮",
    description: "4列版网络大学转磨题帮",
    keyword: "wldxmtb_short_4",
  },
  {
    title: "TXT题库=>磨题帮",
    description: "TXT题库转磨题帮",
    keyword: "txtmtb",
  },
  {
    title: "TXT题库=>考试宝",
    description: "TXT题库转考试宝",
    keyword: "txtksb",
  },
  {
    title: "E现场=>磨题帮",
    description: "E现场转磨题帮",
    keyword: "excmtb",
  },
  {
    title: "E现场=>考试宝",
    description: "E现场转考试宝",
    keyword: "excksb",
  },
];

const Converter = (Reader, Writer, FromPath, ToPath) => {
  writeFile(ToPath, Writer(Reader(FromPath), GetName(ToPath)), () => {
    window.utools.hideMainWindow();
    window.utools.outPlugin();
  });
};

const Selector = (action, itemData, callbackSetList) => {
  let path = utools.showSaveDialog({
    title: "保存位置",
    defaultPath: utools.getPath("downloads"),
    buttonLabel: "保存",
    filters: [
      {
        name: "xls",
        extensions: ["xls"],
      },
      {
        name: "xlsx",
        extensions: ["xlsx"],
      },
    ],
  });

  if (!path) {
    return;
  }
  switch (itemData.keyword) {
    case "wldxmtb":
      Converter(WLDXReader, MTBWriter, action.payload[0].path, path);
      break;
    case "wldxksb":
      Converter(WLDXReader, KSBWriter, action.payload[0].path, path);
      break;
    case "wldxksb_short_4":
      Converter(WLDX4Reader, KSBWriter, action.payload[0].path, path);
      break;
    case "wldxmtb_short_4":
      Converter(WLDX4Reader, MTBWriter, action.payload[0].path, path);
      break;
    case "txtmtb":
      Converter(TxtReader, MTBWriter, action.payload[0].path, path);
      break;
    case "txtksb":
      Converter(TxtReader, KSBWriter, action.payload[0].path, path);
      break;
    case "excmtb":
      Converter(EXCReader, MTBWriter, action.payload[0].path, path);
      break;
    case "excksb":
      Converter(EXCReader, KSBWriter, action.payload[0].path, path);
      break;
  }
};

window.exports = {
  convert: {
    // 注意：键对应的是 plugin.json 中的 features.code
    mode: "list", // 列表模式
    args: {
      // 进入插件时调用（可选）
      enter: (action, callbackSetList) => {
        // 如果进入插件就要显示列表数据
        callbackSetList(TotalList);
      },
      // 用户选择列表中某个条目时被调用
      select: Selector,
      // 子输入框为空时的占位符，默认为字符串"搜索"
      placeholder: "",
    },
  },
};
