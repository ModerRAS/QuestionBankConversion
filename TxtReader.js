const { writeFile } = require("fs"),
  fs = require("fs"),
  iconv = require("iconv-lite")
const jschardet = require("jschardet")

const GetPatternIndex = (stringList, pattern) => {
    var split_list = new Array();
    for (let index = 0; index < stringList.length; index++) {
        const element = stringList[index];
        if (pattern.test(element)) {
            split_list.push(index)
        }
    }
    return split_list
}

const DetectionQuestionType = (fileStringList) => {
    var single = new RegExp("单选|单.+选择");
    var multi = new RegExp("多选|多.+选择")
    var judge = new RegExp("判断")
    var split = new RegExp("单选|单.+选择|多选|多.+选择|判断")
    var split_list = GetPatternIndex(fileStringList, split)
    var QuestionList = {};
    for (let index = 0; index < split_list.length; index++) {
        const element = split_list[index];
        let Question = [];
        if (index + 1 < split_list.length) {
            Question = fileStringList.slice(split_list[index]+1, split_list[index+1])
        } else {
            Question = fileStringList.slice(split_list[index]+1)
        }
        if (single.test(fileStringList[element])) {
            QuestionList.single = Question
        } else if (multi.test(fileStringList[element])) {
            QuestionList.multi = Question
        } else if (judge.test(fileStringList[element])) {
            QuestionList.judge = Question
        }
    }
    return QuestionList
}

const DetectionHasAnswer = (QuestionList) => {
    let correctAnswerReg = new RegExp("^答案")
    let patternIndexList = GetPatternIndex(QuestionList, correctAnswerReg)
    if (patternIndexList.length > 0 && patternIndexList[0]) {
        return true
    } else {
        return false
    }
}

const DetectionSelectQuestion = (QuestionList) => {
    let correctAnswerReg = new RegExp("^答案")
    let patternIndexList = GetPatternIndex(QuestionList, correctAnswerReg)

    let SplitQuestionList = new Array();

    for (let index = 0; index < patternIndexList.length; index++) {
        const element = patternIndexList[index];
        if (index == 0) {
            SplitQuestionList.push(QuestionList.slice(0, patternIndexList[index] + 1))
        } else if (index + 1 >= patternIndexList.length) {
            continue
        } else {
            SplitQuestionList.push(QuestionList.slice(patternIndexList[index-1] + 1, patternIndexList[index] + 1))
        }
    }
    return SplitQuestionList
}

const RecognizeSelectionQuestion = (topicType) => (SplitQuestionList) => {
    let Selection = new RegExp("[AaBbCcDdEeFfGgHhIi][、.．]")
    let correctAnswerReg = new RegExp("[AaBbCcDdEeFfGgHhIi]+")
    let correctAnswer = SplitQuestionList[SplitQuestionList.length - 1].match(correctAnswerReg)[0]
    let toRec = SplitQuestionList.slice(0, -1).join(" ").split(Selection)
    let Question = {}
    Question.topic = toRec[0].trim()
    Question.topicType = topicType
    Question.answer = toRec.slice(1).map(v => v.trim())
    Question.correctAnswer = correctAnswer
    return Question
}

const RecognizeJudgeQuestion = (SplitQuestionList) => {
    let correctAnswerReg = new RegExp("([(（)](对|正确|)[)）]|[(（)](错|错误|)[)）])")
    if (!correctAnswerReg.test(SplitQuestionList)) {
        return
    }
    let correctAnswer = SplitQuestionList.match(correctAnswerReg)[0]
    let Question = {}
    Question.topic = SplitQuestionList.replace(correctAnswerReg, "").trim()
    Question.topicType = "判断题"
    Question.answer = []
    Question.correctAnswer = correctAnswer.match(/错/g)?.length > 0 ? "B" : "A"
    return Question
}

const ConvertJudgeQuestion = (QuestionList) => {
    if (DetectionHasAnswer(QuestionList)) {
        return DetectionSelectQuestion(QuestionList).map(s => RecognizeSelectionQuestion("判断题")(s))
    } else {
        return QuestionList.map(s => RecognizeJudgeQuestion(s))
    }
}

const TxtReader = (filePath) => {
    const buffer = fs.readFileSync(filePath)
    let charset = jschardet.detect(buffer).encoding
    const data = iconv.decode(buffer, charset)
    const fileStringList = data.split("\r\n")
    const QuestionList = DetectionQuestionType(fileStringList)
    const SingleSelectQuestion = DetectionSelectQuestion(QuestionList.single).map(s => RecognizeSelectionQuestion("单选题")(s))
    const MultiSelectQuestion = DetectionSelectQuestion(QuestionList.multi).map(s => RecognizeSelectionQuestion("多选题")(s))
    const JudgeQuestion = ConvertJudgeQuestion(QuestionList.judge)

    return [...SingleSelectQuestion, ...MultiSelectQuestion, ...JudgeQuestion].filter(x => x)
}

module.exports = {
    TxtReader
}