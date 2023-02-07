const { writeFile } = require("fs");

const {GetExtension, WLDXReader, WLDX4Reader, MTBWriter, KSBWriter} = require("./lib")

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
];


const select = (action, itemData, callbackSetList) => {
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

  if (path) {
    switch (itemData.keyword) {
      case "wldxmtb":
        writeFile(
          path,
          MTBWriter(WLDXReader(action.payload[0].path), GetName(path)),
          () => {
            window.utools.hideMainWindow();
            window.utools.outPlugin();
          }
        );
        break;
      case "wldxksb":
        writeFile(
          path,
          KSBWriter(
            WLDXReader(action.payload[0].path),
            GetExtension(path)
          ),
          () => {
            window.utools.hideMainWindow();
            window.utools.outPlugin();
          }
        );
        break;
      case "wldxksb_short_4":
        writeFile(
          path,
          KSBWriter(
            WLDX4Reader(action.payload[0].path),
            GetExtension(path)
          ),
          () => {
            window.utools.hideMainWindow();
            window.utools.outPlugin();
          }
        );
        break;
        case "wldxmtb_short_4":
          writeFile(
            path,
            MTBWriter(
              WLDX4Reader(action.payload[0].path),
              GetExtension(path)
            ),
            () => {
              window.utools.hideMainWindow();
              window.utools.outPlugin();
            }
          );
          break;
    }
  }
}

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
      select: select,
      // 子输入框为空时的占位符，默认为字符串"搜索"
      placeholder: "",
    },
  },
};
