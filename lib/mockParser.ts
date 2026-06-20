/**
 * mockParser.ts
 * 模板系统 + 文案解析器。
 * 当前为 mock 实现，后续可替换为 OpenAI / Claude API。
 */

// ============================================================
//  类型定义
// ============================================================

export type CardSection =
  | { type: "tag"; label: string; text: string }
  | { type: "box"; text: string }
  | { type: "flow"; items: string[] }
  | { type: "highlight"; text: string }
  | { type: "circle"; text: string }
  | { type: "strikethrough"; text: string }
  | { type: "comparison"; left: { label: string; text: string }; right: { label: string; text: string } }
  | { type: "annotation"; text: string };

export type TemplateId =
  | "contrast" | "wrong-right" | "three-steps" | "checklist" | "pain-point"
  | "story" | "data" | "quote" | "qa" | "comparison"
  | "flash-sale" | "testimonial" | "methodology" | "trending" | "education";

export type CardData = {
  template: TemplateId;
  title: string;
  subtitle?: string;
  sections: CardSection[];
};

export type TemplateDef = {
  id: TemplateId;
  name: string;
  description: string;
  icon: string;
  defaultInput: string;
  placeholder: string;
};

// ============================================================
//  5 种模板定义
// ============================================================

export const templates: TemplateDef[] = [
  {
    id: "contrast",
    name: "认知反差型",
    description: "打破常见认知，制造「原来如此」的冲击感",
    icon: "💡",
    placeholder: "第一行：标题\n第二行：副标题\n\n然后逐行输入内容，解析器会自动识别反差结构",
    defaultInput: `你以为努力就能成功？
关于职场晋升的真相

你以为的晋升路径
努力工作 → 等待认可 → 获得提拔

实际的晋升逻辑
主动展示 → 建立影响力 → 争取机会

大多数人把"努力"当成了目的
却忘了努力只是基本功

==真正拉开差距的是"被看见"的能力==`
  },
  {
    id: "wrong-right",
    name: "错误/正确对比型",
    description: "用❌✅直观对比，让读者立刻纠正行为",
    icon: "🔄",
    placeholder: "第一行：标题\n第二行：副标题\n\n错误做法和正确做法会自动配对",
    defaultInput: `高效沟通的正确姿势
职场人必学

错误：一上来就说自己的需求
正确：先确认对方是否方便

错误：发一大段语音让人听半天
正确：用文字列清楚1234

错误：只说问题不说解决方案
正确：带着方案去沟通

==高手沟通的核心：先给价值，再提需求==`
  },
  {
    id: "three-steps",
    name: "三步方法型",
    description: "简单三步，降低行动门槛，让读者觉得「我也能做到」",
    icon: "🪜",
    placeholder: "第一行：标题\n第二行：副标题\n\n每一步会自动生成流程卡片",
    defaultInput: `从零开始做短视频
新手也能上手的方法

第一步：选题
找到你最擅长的1个领域，列出10个常见问题

第二步：录制
用手机对着自己，每个问题回答60秒

第三步：发布
每天发1条，坚持30天看数据反馈

==最简单的方法，往往最有效==`
  },
  {
    id: "checklist",
    name: "问题清单型",
    description: "用清单引发自查，读者会不自觉对号入座",
    icon: "📋",
    placeholder: "第一行：标题\n第二行：副标题\n\n每行一个问题，会自动生成编号清单",
    defaultInput: `你的团队还有救吗？
5个危险信号自查

团队成员开会时从不主动发言
有功劳大家抢，出问题互相推
优秀员工开始悄悄更新简历
客户投诉越来越多但没人跟进
团队目标每月都在变

==中了3个以上，该认真反思了==`
  },
  {
    id: "pain-point",
    name: "痛点成交型",
    description: "先放大痛点，再给出解决方案，推动行动",
    icon: "🎯",
    placeholder: "第一行：标题\n第二行：副标题\n\n描述痛点和解决方案",
    defaultInput: `客户只有两种状态
以保险行业为例

第一种：维他命
今天买也行，明天买也行，不吃也不会死

第二种：止痛药
现在就需要，没有就不行

流程：看到了 -> 学到了 -> 收藏了
重点：但永远下不了付款的决心

==成交的关键是让客户感受到"痛"==`
  },
  {
    id: "story",
    name: "故事型",
    description: "用真实故事引发共鸣，代入感极强",
    icon: "📖",
    placeholder: "第一行：标题\n第二行：副标题\n\n用叙事方式写故事，最后点出道理",
    defaultInput: `月薪3千到3万
我只做了一件事

三年前我还是个普通文员
每天重复同样的工作，看不到希望

直到有一天领导让我做汇报
我才发现自己连PPT都做不好

从那天起我每天花1小时学一个新技能
Excel、PPT、数据分析、项目管理…

三年后我成了部门最年轻的主管
不是因为我聪明，而是因为我比别人多走了一步

==你今天的努力，是三年后你的底气==`
  },
  {
    id: "data",
    name: "数据冲击型",
    description: "用数字制造冲击，增强说服力",
    icon: "📊",
    placeholder: "第一行：标题\n第二行：副标题\n\n用数字/数据开头的行会高亮",
    defaultInput: `90%的人不知道的消费真相
看完你会重新审视自己的钱包

每天一杯奶茶30元
一年就是10950元

每天刷短视频2小时
一年就是730小时，相当于30天

80%的冲动消费发生在晚上10点后
因为这时候你的理性判断力最低

==你的钱不是花没的，是"刷"没的==`
  },
  {
    id: "quote",
    name: "金句卡片型",
    description: "一句金句 + 解读，适合传播和收藏",
    icon: "💬",
    placeholder: "第一行：金句（会高亮显示）\n第二行：出处/作者\n\n后面是解读内容",
    defaultInput: `种一棵树最好的时间是十年前，其次是现在
——非洲谚语

很多人总说"等我准备好了再开始"
但真相是你永远不会准备好

完美主义是行动力最大的敌人
先完成，再完美

60分的开始胜过100分的空想
你不需要看清整条路，只需迈出第一步

==别等了，现在就是最好的时机==`
  },
  {
    id: "qa",
    name: "问答解惑型",
    description: "用提问开头引发好奇，用回答给价值",
    icon: "❓",
    placeholder: "第一行：标题\n第二行：副标题\n\n提问和回答会自动识别",
    defaultInput: `为什么你总是存不下钱？
不是收入低，是思维有问题

问：为什么月薪1万也存不下钱？
答：因为你把"收入-支出=储蓄"搞反了

问：那正确的做法是什么？
答：收入-储蓄=支出，先存再花

问：具体怎么操作？
答：工资到账当天自动转走20%，剩下的才是你的预算

==存钱不是克制欲望，是重新设计规则==`
  },
  {
    id: "flash-sale",
    name: "限时促销型",
    description: "制造紧迫感，推动立刻行动",
    icon: "⏰",
    placeholder: "第一行：标题\n第二行：副标题\n\n限时/限量信息会自动高亮",
    defaultInput: `最后3天！年度最大优惠
错过再等一年

原价399，今天只要99
直降300元，史无前例

前100名下单再送价值199元赠品
已报名87人，仅剩13个名额

活动截止：本周日24:00
逾期恢复原价，不补单

==犹豫一秒，可能就少一个名额==`
  },
  {
    id: "testimonial",
    name: "用户证言型",
    description: "用真实反馈建立信任，消除顾虑",
    icon: "🗣️",
    placeholder: "第一行：标题\n第二行：副标题\n\n用户反馈会自动识别",
    defaultInput: `学员真实反馈
看看他们怎么说

学了3天就做出了第一个短视频
以前完全不敢面对镜头

——小李，宝妈，0基础

现在每个月副业收入稳定过万
真的很感谢当初的自己迈出了第一步

——张哥，上班族，副业做自媒体

课程内容很实用，不是那种鸡汤
每一步都有具体的操作方法

==1280位学员的选择，不是没有原因==`
  },
  {
    id: "methodology",
    name: "方法论型",
    description: "系统化框架，显得专业权威",
    icon: "🧩",
    placeholder: "第一行：标题\n第二行：副标题\n\n方法论会自动识别为流程",
    defaultInput: `高效学习的底层逻辑
IECR学习法

输入 Input
大量阅读、听课、观察，获取原始素材

编码 Encode
用自己的话重新组织，建立知识连接

内化 Consume
反复实践，把知识变成直觉反应

输出 Record
写文章、做分享、教别人，倒逼自己真正理解

==学100遍不如教1遍==`
  },
  {
    id: "trending",
    name: "热点借势型",
    description: "蹭热点引流，快速吸引注意力",
    icon: "🔥",
    placeholder: "第一行：标题\n第二行：副标题\n\n热点话题 + 你的观点",
    defaultInput: `ChatGPT之后普通人怎么办
3个不会被AI替代的能力

第一个：提出好问题的能力
AI再强也需要人来提问

第二个：审美和品味
AI可以生成内容，但无法判断美丑

第三个：人与人的连接
信任、共情、说服，这些AI做不到

==与其担心被替代，不如先学会驾驭==`
  },
  {
    id: "education",
    name: "知识科普型",
    description: "把复杂概念讲清楚，建立专业形象",
    icon: "🎓",
    placeholder: "第一行：标题\n第二行：副标题\n\n逐条解释概念",
    defaultInput: `什么是复利效应？
一个改变你财富观的概念

复利 = 利息生利息
不只是本金在赚钱，利息也在赚钱

年化10%，10万本金
10年后变成25.9万
30年后变成174.5万

关键不是利率高低
而是时间够不够长

==种一棵树最好的时间是十年前，其次是现在==`
  }
];

// ============================================================
//  解析器入口
// ============================================================

export function mockParseToCardData(input: string, templateId: TemplateId = "pain-point"): CardData {
  switch (templateId) {
    case "contrast":     return parseContrast(input);
    case "wrong-right":  return parseWrongRight(input);
    case "three-steps":  return parseThreeSteps(input);
    case "checklist":    return parseChecklist(input);
    case "pain-point":   return parsePainPoint(input);
    case "story":        return parseStory(input);
    case "data":         return parseData(input);
    case "quote":        return parseQuote(input);
    case "qa":           return parseQA(input);
    case "comparison":   return parseComparison(input);
    case "flash-sale":   return parseFlashSale(input);
    case "testimonial":  return parseTestimonial(input);
    case "methodology":  return parseMethodology(input);
    case "trending":     return parseTrending(input);
    case "education":    return parseEducation(input);
    default:             return parsePainPoint(input);
  }
}

// ============================================================
//  通用工具
// ============================================================

const splitFlow = (value: string) =>
  value
    .split(/(?:->|→|=>|➡|,|，|、|\|)/)
    .map((s) => s.trim())
    .filter(Boolean);

function extractTitleSubtitle(lines: string[]): { title: string; subtitle?: string; rest: string[] } {
  const title = lines[0] || "（未命名）";
  const second = lines[1];
  if (second && second.length < 20 && !/[：:]/.test(second)) {
    return { title, subtitle: second, rest: lines.slice(2) };
  }
  return { title, rest: lines.slice(1) };
}

function parseHighlightLine(line: string): string | null {
  const m = line.match(/^==(.+)==$/);
  if (m) return m[1];
  if (/^(重点|强调|结论|记住|核心)[:：]/.test(line)) {
    return line.replace(/^(重点|强调|结论|记住|核心)[:：]/, "").trim();
  }
  return null;
}

// ============================================================
//  认知反差型
// ============================================================

function parseContrast(input: string): CardData {
  const lines = input.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const { title, subtitle, rest } = extractTitleSubtitle(lines);
  const sections: CardSection[] = [];

  let i = 0;
  while (i < rest.length) {
    const line = rest[i];

    // highlight
    const hl = parseHighlightLine(line);
    if (hl) {
      sections.push({ type: "highlight", text: hl });
      i++;
      continue;
    }

    // "你以为" 段 → strikethrough (旧认知)
    if (/^你以为/.test(line) || /常见的/.test(line) || /大多数/.test(line)) {
      const text = line.replace(/^[:：]\s*/, "");
      sections.push({ type: "strikethrough", text });
      i++;
      // 下一行可能是 flow
      if (i < rest.length && (rest[i].includes("→") || rest[i].includes("->"))) {
        sections.push({ type: "flow", items: splitFlow(rest[i]) });
        i++;
      }
      continue;
    }

    // "实际" / "真相" 段 → highlight (新认知)
    if (/^实际|^真相|^真正的?|^真正拉开/.test(line)) {
      sections.push({ type: "highlight", text: line });
      i++;
      if (i < rest.length && (rest[i].includes("→") || rest[i].includes("->"))) {
        sections.push({ type: "flow", items: splitFlow(rest[i]) });
        i++;
      }
      continue;
    }

    // 含箭头 → flow
    if (line.includes("→") || line.includes("->")) {
      sections.push({ type: "flow", items: splitFlow(line) });
      i++;
      continue;
    }

    // 默认 → box
    sections.push({ type: "box", text: line });
    i++;
  }

  return { template: "contrast", title, subtitle, sections };
}

// ============================================================
//  错误/正确对比型
// ============================================================

function parseWrongRight(input: string): CardData {
  const lines = input.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const { title, subtitle, rest } = extractTitleSubtitle(lines);
  const sections: CardSection[] = [];

  let i = 0;
  while (i < rest.length) {
    const line = rest[i];

    const hl = parseHighlightLine(line);
    if (hl) {
      sections.push({ type: "highlight", text: hl });
      i++;
      continue;
    }

    // 匹配 "错误：xxx" + 下一行 "正确：xxx"
    const wrongMatch = line.match(/^(错误|❌|×|误区)[:：]\s*(.+)/);
    if (wrongMatch) {
      const wrongText = wrongMatch[2];
      const nextLine = rest[i + 1];
      const rightMatch = nextLine?.match(/^(正确|✅|√|正解)[:：]\s*(.+)/);
      if (rightMatch) {
        sections.push({
          type: "comparison",
          left: { label: "❌ 错误", text: wrongText },
          right: { label: "✅ 正确", text: rightMatch[2] }
        });
        i += 2;
        continue;
      }
      // 只有错误没有正确 → 用 box
      sections.push({ type: "box", text: `❌ ${wrongText}` });
      i++;
      continue;
    }

    // 匹配独立的 "正确：xxx"
    const rightMatch = line.match(/^(正确|✅|√|正解)[:：]\s*(.+)/);
    if (rightMatch) {
      sections.push({ type: "box", text: `✅ ${rightMatch[2]}` });
      i++;
      continue;
    }

    sections.push({ type: "box", text: line });
    i++;
  }

  return { template: "wrong-right", title, subtitle, sections };
}

// ============================================================
//  三步方法型
// ============================================================

function parseThreeSteps(input: string): CardData {
  const lines = input.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const { title, subtitle, rest } = extractTitleSubtitle(lines);
  const sections: CardSection[] = [];

  let i = 0;
  while (i < rest.length) {
    const line = rest[i];

    const hl = parseHighlightLine(line);
    if (hl) {
      sections.push({ type: "highlight", text: hl });
      i++;
      continue;
    }

    // 匹配 "第X步：标题" + 可选的下一行说明
    const stepMatch = line.match(/^(第[一二三四五六七八九十\d]+步)[:：]\s*(.*)/);
    if (stepMatch) {
      const stepLabel = stepMatch[1];
      const stepTitle = stepMatch[2];
      const nextLine = rest[i + 1];

      // 如果当前行有标题，下一行作为说明
      if (stepTitle && nextLine && !/^第/.test(nextLine) && !parseHighlightLine(nextLine)) {
        sections.push({ type: "tag", label: stepLabel, text: `${stepTitle}：${nextLine}` });
        i += 2;
      } else if (stepTitle) {
        sections.push({ type: "tag", label: stepLabel, text: stepTitle });
        i++;
      } else if (nextLine) {
        sections.push({ type: "tag", label: stepLabel, text: nextLine });
        i += 2;
      } else {
        i++;
      }
      continue;
    }

    sections.push({ type: "box", text: line });
    i++;
  }

  // 如果没有识别到步骤，不强制转换（保留原始 box）

  return { template: "three-steps", title, subtitle, sections };
}

// ============================================================
//  问题清单型
// ============================================================

function parseChecklist(input: string): CardData {
  const lines = input.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const { title, subtitle, rest } = extractTitleSubtitle(lines);
  const sections: CardSection[] = [];

  let problemIdx = 0;
  let i = 0;
  while (i < rest.length) {
    const line = rest[i];

    const hl = parseHighlightLine(line);
    if (hl) {
      sections.push({ type: "highlight", text: hl });
      i++;
      continue;
    }

    // 每行非空内容 → circle 编号 + box 内容
    if (line.length > 0) {
      problemIdx++;
      sections.push({ type: "circle", text: `${problemIdx}` });
      sections.push({ type: "box", text: line });
      i++;
      continue;
    }

    i++;
  }

  return { template: "checklist", title, subtitle, sections };
}

// ============================================================
//  痛点成交型（原有模板增强）
// ============================================================

function parsePainPoint(input: string): CardData {
  const lines = input.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const { title, subtitle, rest } = extractTitleSubtitle(lines);
  const sections: CardSection[] = [];

  let i = 0;
  while (i < rest.length) {
    const line = rest[i];

    // highlight
    const hl = parseHighlightLine(line);
    if (hl) {
      sections.push({ type: "highlight", text: hl });
      i++;
      continue;
    }

    // flow
    if (/^(流程|路径|步骤)[:：]/.test(line)) {
      sections.push({ type: "flow", items: splitFlow(line.replace(/^(流程|路径|步骤)[:：]/, "")) });
      i++;
      continue;
    }
    if (line.includes("→") || line.includes("->")) {
      sections.push({ type: "flow", items: splitFlow(line) });
      i++;
      continue;
    }

    // tag: "第一种：维他命" 格式
    const tagMatch = line.match(/^(第[一二三四五六七八九十\d]+种|类型[一二三四五六七八九十\dA-Za-z]*)[:：]\s*(.*)/);
    if (tagMatch) {
      const label = tagMatch[1];
      const inlineText = tagMatch[2];
      const nextLine = rest[i + 1];
      if (inlineText) {
        sections.push({ type: "tag", label, text: inlineText });
        i++;
      } else if (nextLine && !/^(第|流程|重点|类型)/.test(nextLine) && !parseHighlightLine(nextLine)) {
        sections.push({ type: "tag", label, text: nextLine });
        i += 2;
      } else {
        sections.push({ type: "tag", label, text: "…" });
        i++;
      }
      continue;
    }

    // annotation
    if (/^(注意|提示|提醒|注)[:：]/.test(line)) {
      sections.push({ type: "annotation", text: line.replace(/^(注意|提示|提醒|注)[:：]/, "").trim() });
      i++;
      continue;
    }

    // 默认 box
    sections.push({ type: "box", text: line });
    i++;
  }

  return { template: "pain-point", title, subtitle, sections };
}

// ============================================================
//  故事型
// ============================================================

function parseStory(input: string): CardData {
  const lines = input.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const { title, subtitle, rest } = extractTitleSubtitle(lines);
  const sections: CardSection[] = [];

  for (let i = 0; i < rest.length; i++) {
    const line = rest[i];
    const hl = parseHighlightLine(line);
    if (hl) { sections.push({ type: "highlight", text: hl }); continue; }
    sections.push({ type: "box", text: line });
  }

  return { template: "story", title, subtitle, sections };
}

// ============================================================
//  数据冲击型
// ============================================================

function parseData(input: string): CardData {
  const lines = input.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const { title, subtitle, rest } = extractTitleSubtitle(lines);
  const sections: CardSection[] = [];

  for (let i = 0; i < rest.length; i++) {
    const line = rest[i];
    const hl = parseHighlightLine(line);
    if (hl) { sections.push({ type: "highlight", text: hl }); continue; }

    // 以数字开头或含有百分比/大数字的行 → highlight（数据冲击）
    if (/^\d/.test(line) || /\d+%|\d{3,}/.test(line)) {
      sections.push({ type: "highlight", text: line });
      continue;
    }

    sections.push({ type: "box", text: line });
  }

  return { template: "data", title, subtitle, sections };
}

// ============================================================
//  金句卡片型
// ============================================================

function parseQuote(input: string): CardData {
  const lines = input.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const { title, subtitle, rest } = extractTitleSubtitle(lines);
  const sections: CardSection[] = [];

  // 第一行是金句 → highlight
  if (rest.length > 0) {
    sections.push({ type: "highlight", text: rest[0] });
  }

  for (let i = 1; i < rest.length; i++) {
    const line = rest[i];
    const hl = parseHighlightLine(line);
    if (hl) { sections.push({ type: "highlight", text: hl }); continue; }
    sections.push({ type: "box", text: line });
  }

  return { template: "quote", title, subtitle, sections };
}

// ============================================================
//  问答解惑型
// ============================================================

function parseQA(input: string): CardData {
  const lines = input.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const { title, subtitle, rest } = extractTitleSubtitle(lines);
  const sections: CardSection[] = [];

  let i = 0;
  while (i < rest.length) {
    const line = rest[i];
    const hl = parseHighlightLine(line);
    if (hl) { sections.push({ type: "highlight", text: hl }); i++; continue; }

    const qMatch = line.match(/^问[:：]\s*(.*)/);
    if (qMatch) {
      const qText = qMatch[1] || line;
      const nextLine = rest[i + 1];
      const aMatch = nextLine?.match(/^答[:：]\s*(.*)/);
      if (aMatch) {
        sections.push({
          type: "comparison",
          left: { label: "❓ 问", text: qText },
          right: { label: "💡 答", text: aMatch[1] }
        });
        i += 2;
        continue;
      }
      sections.push({ type: "box", text: `❓ ${qText}` });
      i++;
      continue;
    }

    const aMatch = line.match(/^答[:：]\s*(.*)/);
    if (aMatch) {
      sections.push({ type: "box", text: `💡 ${aMatch[1]}` });
      i++;
      continue;
    }

    sections.push({ type: "box", text: line });
    i++;
  }

  return { template: "qa", title, subtitle, sections };
}

// ============================================================
//  前后对比型
// ============================================================

function parseComparison(input: string): CardData {
  const lines = input.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const { title, subtitle, rest } = extractTitleSubtitle(lines);
  const sections: CardSection[] = [];

  let i = 0;
  while (i < rest.length) {
    const line = rest[i];
    const hl = parseHighlightLine(line);
    if (hl) { sections.push({ type: "highlight", text: hl }); i++; continue; }

    // 匹配 "以前/之前/过去：xxx" + "现在/之后/如今：xxx"
    const beforeMatch = line.match(/^(以前|之前|过去|曾经|旧)[:：]\s*(.*)/);
    if (beforeMatch) {
      const nextLine = rest[i + 1];
      const afterMatch = nextLine?.match(/^(现在|之后|如今|新|以后)[:：]\s*(.*)/);
      if (afterMatch) {
        sections.push({
          type: "comparison",
          left: { label: "⏪ 以前", text: beforeMatch[2] || beforeMatch[1] },
          right: { label: "⏩ 现在", text: afterMatch[2] || afterMatch[1] }
        });
        i += 2;
        continue;
      }
      sections.push({ type: "strikethrough", text: beforeMatch[2] || beforeMatch[1] });
      i++;
      continue;
    }

    sections.push({ type: "box", text: line });
    i++;
  }

  return { template: "comparison", title, subtitle, sections };
}

// ============================================================
//  限时促销型
// ============================================================

function parseFlashSale(input: string): CardData {
  const lines = input.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const { title, subtitle, rest } = extractTitleSubtitle(lines);
  const sections: CardSection[] = [];

  for (const line of rest) {
    const hl = parseHighlightLine(line);
    if (hl) { sections.push({ type: "highlight", text: hl }); continue; }
    // 价格/数字/限时信息高亮
    if (/(\d+元|\d+折|原价|限时|最后|仅剩|截止|名额)/.test(line)) {
      sections.push({ type: "highlight", text: line });
      continue;
    }
    sections.push({ type: "box", text: line });
  }

  return { template: "flash-sale", title, subtitle, sections };
}

// ============================================================
//  用户证言型
// ============================================================

function parseTestimonial(input: string): CardData {
  const lines = input.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const { title, subtitle, rest } = extractTitleSubtitle(lines);
  const sections: CardSection[] = [];

  let i = 0;
  while (i < rest.length) {
    const line = rest[i];
    const hl = parseHighlightLine(line);
    if (hl) { sections.push({ type: "highlight", text: hl }); i++; continue; }

    // "——xxx" 格式作为 annotation
    if (/^——/.test(line)) {
      sections.push({ type: "annotation", text: line });
      i++;
      continue;
    }

    sections.push({ type: "box", text: line });
    i++;
  }

  return { template: "testimonial", title, subtitle, sections };
}

// ============================================================
//  方法论型
// ============================================================

function parseMethodology(input: string): CardData {
  const lines = input.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const { title, subtitle, rest } = extractTitleSubtitle(lines);
  const sections: CardSection[] = [];

  let i = 0;
  while (i < rest.length) {
    const line = rest[i];
    const hl = parseHighlightLine(line);
    if (hl) { sections.push({ type: "highlight", text: hl }); i++; continue; }

    // 英文缩写 + 中文标签 → tag
    const tagMatch = line.match(/^([A-Z]{2,}[\s\S]*?)\s+(.+)/);
    if (tagMatch) {
      const nextLine = rest[i + 1];
      if (nextLine && !parseHighlightLine(nextLine) && !/^——/.test(nextLine)) {
        sections.push({ type: "tag", label: tagMatch[1], text: nextLine });
        i += 2;
        continue;
      }
      sections.push({ type: "tag", label: tagMatch[1], text: tagMatch[2] });
      i++;
      continue;
    }

    sections.push({ type: "box", text: line });
    i++;
  }

  return { template: "methodology", title, subtitle, sections };
}

// ============================================================
//  热点借势型
// ============================================================

function parseTrending(input: string): CardData {
  const lines = input.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const { title, subtitle, rest } = extractTitleSubtitle(lines);
  const sections: CardSection[] = [];

  let i = 0;
  while (i < rest.length) {
    const line = rest[i];
    const hl = parseHighlightLine(line);
    if (hl) { sections.push({ type: "highlight", text: hl }); i++; continue; }

    // "第X个：xxx" 格式 → tag
    const tagMatch = line.match(/^(第[一二三四五六七八九十\d]+个)[:：]\s*(.*)/);
    if (tagMatch) {
      const nextLine = rest[i + 1];
      if (nextLine && !parseHighlightLine(nextLine)) {
        sections.push({ type: "tag", label: tagMatch[1], text: `${tagMatch[2]}：${nextLine}` });
        i += 2;
        continue;
      }
      sections.push({ type: "tag", label: tagMatch[1], text: tagMatch[2] });
      i++;
      continue;
    }

    sections.push({ type: "box", text: line });
    i++;
  }

  return { template: "trending", title, subtitle, sections };
}

// ============================================================
//  知识科普型
// ============================================================

function parseEducation(input: string): CardData {
  const lines = input.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const { title, subtitle, rest } = extractTitleSubtitle(lines);
  const sections: CardSection[] = [];

  let i = 0;
  while (i < rest.length) {
    const line = rest[i];
    const hl = parseHighlightLine(line);
    if (hl) { sections.push({ type: "highlight", text: hl }); i++; continue; }

    // 数字相关行高亮
    if (/\d+万|\d+年|\d+%|\d+年后/.test(line)) {
      sections.push({ type: "highlight", text: line });
      i++;
      continue;
    }

    // 短标题 + 下一行解释 → tag
    if (line.length <= 12 && i + 1 < rest.length && rest[i + 1].length > line.length) {
      sections.push({ type: "tag", label: line, text: rest[i + 1] });
      i += 2;
      continue;
    }

    sections.push({ type: "box", text: line });
    i++;
  }

  return { template: "education", title, subtitle, sections };
}

// ============================================================
//  默认输入（兼容旧版导入）
// ============================================================

export const defaultCardInput = templates[4].defaultInput;
