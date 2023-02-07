const fs = require("fs"),
  xlsx = require("xlsx"),
  { utils } = require("xlsx");


const GetExtension = (path) => {
    const pathTmp = path.split(".");
    return pathTmp[pathTmp.length - 1];
  };
  
  const GetName = (path) => {
    const pathTmpList = path.replace(/\\/g, "/").split("/");
    let pathTmp = pathTmpList[pathTmpList.length - 1].split(".");
    pathTmp.pop();
    return pathTmp.join(".");
  };
  
  const WordReader = (filePath) => {
  
  }
  
  const WLDXReader = (filePath) => {
    // 获取数据
    let data = [];
    const excelBuffer = fs.readFileSync(filePath);
  
    // 解析数据
    const workbook = xlsx.read(excelBuffer, {
      type: "buffer",
      cellHTML: false,
    });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  
    const length = parseInt(worksheet["!ref"].split(":")[1].match(/[0-9]+/));
  
    console.log(length);
  
    let toSheet = [];

    for (let index = 3; index < length + 1; index++) {
      try {
        let topicData = {};
        topicData.topic = worksheet[`G${index}`].v.trim().trim('"');
        topicData.topicType = worksheet[`F${index}`].v.trim().trim('"');
        topicData.answer = worksheet[`H${index}`]?.v
          .trim()
          .trim('"')
          .replace(/；/g, ";")
          .split("$;$") ?? [];
        topicData.correctAnswer = worksheet[`I${index}`].v.trim().trim('"');
        toSheet.push(topicData);
      } catch (e) {
        console.log(e);
      }
    }
  
    return toSheet;
  };
  
  const WLDX4Reader = (filePath) => {
    // 获取数据
    let data = [];
    const excelBuffer = fs.readFileSync(filePath);
  
    // 解析数据
    const workbook = xlsx.read(excelBuffer, {
      type: "buffer",
      cellHTML: false,
    });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  
    const length = parseInt(worksheet["!ref"].split(":")[1].match(/[0-9]+/));
  
    console.log(length);
  
    let toSheet = [];
  
    for (let index = 2; index < length + 1; index++) {
      try {
        let topicData = {};
        topicData.topic = worksheet[`B${index}`].v.trim().trim('"');
        topicData.topicType = worksheet[`A${index}`].v.trim().trim('"');
        topicData.answer = worksheet[`C${index}`]?.v
          .trim()
          .trim('"')
          .replace(/；/g, ";")
          .split("$;$") ?? [];
        topicData.correctAnswer = worksheet[`D${index}`].v.trim().trim('"');
        toSheet.push(topicData);
      } catch (e) {
        console.log(e);
      }
    }
  
    return toSheet;
  };
  
  const KSBWriter = (AnswerList, extension) => {
    console.log(AnswerList);
    const toSheet = AnswerList.map((element) => {
      const topic = element.topic;
      const topicType = element.topicType;
      const answer = element.answer;
      const correctAnswer = element.correctAnswer;
      if (topic != "") {
        return {
          "题干（必填）": topic,
          "题型 （必填）": topicType,
          "选项 A": answer[0] ? answer[0] : "",
          "选项 B": answer[1] ? answer[1] : "",
          "选项 C": answer[2] ? answer[2] : "",
          "选项 D": answer[3] ? answer[3] : "",
          "选项E\n(勿删)": answer[4] ? answer[4] : "",
          "选项F\n(勿删)": answer[5] ? answer[5] : "",
          "选项G\n(勿删)": answer[6] ? answer[6] : "",
          "选项H\n(勿删)": answer[7] ? answer[7] : "",
          "正确答案H\n（必填）": correctAnswer,
          解析: "",
          章节: "",
          难度: "",
        };
      }
    });
  
    console.log(toSheet);
  
    let out_worksheet = xlsx.utils.json_to_sheet(toSheet, {
      header: [
        "题干（必填）",
        "题型 （必填）",
        "选项 A",
        "选项 B",
        "选项 C",
        "选项 D",
        "选项E\n(勿删)",
        "选项F\n(勿删)",
        "选项G\n(勿删)",
        "选项H\n(勿删)",
        "正确答案H\n（必填）",
        "解析",
        "章节",
        "难度",
      ],
      skipHeader: false, // 跳过上面的标题行
    });
  
    let workBook = utils.book_new();
  
    utils.book_append_sheet(workBook, out_worksheet, "Sheet1");
  
    const result = xlsx.write(workBook, {
      bookType: extension, // 输出的文件类型
      type: "buffer", // 输出的数据类型
      compression: true, // 开启zip压缩
    });
  
    return result;
  };
  
  const MTBWriter = (AnswerList, title) => {
    console.log(AnswerList);
    const merge = [
      { s: { r: 0, c: 1 }, e: { r: 0, c: 8 } },
      { s: { r: 1, c: 1 }, e: { r: 1, c: 8 } },
    ];
    const Header = [
      ["标题", title],
      ["描述", title],
      ["用时", "1000"],
      [
        "题干",
        "题型",
        "选择项1",
        "选择项2",
        "选择项3",
        "选择项4",
        "选择项5",
        "解析",
        "答案1",
        "答案2",
        "得分1",
        "得分2",
      ],
    ];
    const toSheet = AnswerList.map((element) => {
      const topic = element.topic;
      const topicType = element.topicType;
      const answer = element.answer;
      const correctAnswer = element.correctAnswer;
      const pattern = RegExp(/对|正确|错|错误/);
      if (topic != "") {
        let output = [topic, topicType, ...answer];
        output[8] = correctAnswer;
        output[10] = "1";
        return output;
      }
    });
  
    console.log(toSheet);
  
    let out_worksheet = xlsx.utils.aoa_to_sheet([...Header, ...toSheet]);
  
    out_worksheet["!merges"] = merge;
  
    let workBook = utils.book_new();
  
    utils.book_append_sheet(workBook, out_worksheet, "Sheet1");
  
    const result = xlsx.write(workBook, {
      bookType: "xls", // 输出的文件类型
      type: "buffer", // 输出的数据类型
      compression: true, // 开启zip压缩
    });
  
    return result;
  };


module.exports = {GetExtension, WLDXReader, WLDX4Reader, MTBWriter, KSBWriter}