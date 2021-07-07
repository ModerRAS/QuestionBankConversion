const {
    writeFile
} = require('fs'),
    fs = require('fs'),
    xlsx = require('xlsx'), {
        utils
    } = require('xlsx')


const TotalList = [{
        title: '网络大学=>磨题帮',
        description: '网络大学转磨题帮',
        keyword: "wldxmtb"
    },
    {
        title: '网络大学=>考试宝',
        description: '网络大学转考试宝',
        keyword: "wldxksb"
    }
];

const GetExtension = (path) => {
    const pathTmp = path.split(".")
    return pathTmp[pathTmp.length - 1]
}

const WLDXReader = (filePath) => {
    // 获取数据
    let data = []
    const excelBuffer = fs.readFileSync(filePath);

    // 解析数据
    const workbook = xlsx.read(excelBuffer, {
        type: 'buffer',
        cellHTML: false,
    });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]

    const length = parseInt(worksheet["!ref"].split(":")[1].match(/[0-9]+/))

    console.log(length)

    let toSheet = []

    for (let index = 3; index < length; index++) {
        try {
            let topicData = {}
            topicData.topic = worksheet[`G${index}`].v.trim().trim("\"");
            topicData.topicType = worksheet[`F${index}`].v.trim().trim("\"");
            topicData.answer = worksheet[`H${index}`].v.trim().trim("\"").replace(/；/g, ";").split("$;$");
            topicData.correctAnswer = worksheet[`I${index}`].v.trim().trim("\"");
            toSheet.push(topicData)
        } catch (e) {
            console.log(e)
        }
    }

    return toSheet
}

const KSBWriter = (AnswerList, extension) => {
    console.log(AnswerList)
    const toSheet = AnswerList.map(element => {
        const topic = element.topic
        const topicType = element.topicType
        const answer = element.answer
        const correctAnswer = element.correctAnswer
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
                "解析": "",
                "章节": "",
                "难度": "",
            }
        }
    });

    console.log(toSheet)

    let out_worksheet = xlsx.utils.json_to_sheet(toSheet, {
        header: ["题干（必填）", "题型 （必填）", "选项 A", "选项 B", "选项 C", "选项 D", "选项E\n(勿删)", "选项F\n(勿删)", "选项G\n(勿删)", "选项H\n(勿删)", "正确答案H\n（必填）", "解析", "章节", "难度"],
        skipHeader: false // 跳过上面的标题行
    })

    let workBook = utils.book_new()

    utils.book_append_sheet(workBook, out_worksheet, 'Sheet1');

    const result = xlsx.write(workBook, {
        bookType: extension, // 输出的文件类型
        type: 'buffer', // 输出的数据类型
        compression: true // 开启zip压缩
    });

    return result
}

window.exports = {
    "convert": { // 注意：键对应的是 plugin.json 中的 features.code
        mode: "list", // 列表模式
        args: {
            // 进入插件时调用（可选）
            enter: (action, callbackSetList) => {
                // 如果进入插件就要显示列表数据
                callbackSetList(TotalList)
                console.log(action)
            },
            // 子输入框内容变化时被调用 可选 (未设置则无搜索)
            search: (action, searchWord, callbackSetList) => {
                // 获取一些数据
                // 执行 callbackSetList 显示出来

                callbackSetList(TotalList.filter((element) => {
                    const length = searchWord.length;
                    const matches = [...searchWord].reduce((total, perWord) => {
                        if (element.keyword.indexOf(perWord) != -1) {
                            return total + 1
                        } else {
                            return total
                        }
                    })
                    if (matches === length) {
                        return true
                    }
                }))
            },
            // 用户选择列表中某个条目时被调用
            select: (action, itemData, callbackSetList) => {
                let path = utools.showSaveDialog({
                    title: '保存位置',
                    defaultPath: utools.getPath('downloads'),
                    buttonLabel: '保存',
                    filters: [{
                        name: "xls",
                        extensions: ["xls"]
                    }, {
                        name: "xlsx",
                        extensions: ["xlsx"]
                    }]
                })

                if (path) {
                    switch (itemData.keyword) {
                        case "wldxmtb":
                            // const toSheet = WLDXReader(action.payload.path)
                            break;
                        case "wldxksb":
                            writeFile(path, KSBWriter(WLDXReader(action.payload[0].path), GetExtension(path)), () => {
                                window.utools.hideMainWindow()
                                window.utools.outPlugin()
                            })
                            break;
                    }



                }
            },
            // 子输入框为空时的占位符，默认为字符串"搜索"
            placeholder: ""
        }
    }
}