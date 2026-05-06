/**
 * 《流星雨的约定》游戏数据层
 * 集中管理所有页面数据、密码、提示、搜索映射、全局状态和导航关系
 */

const gameData = {

  // ========== 页面数据 ==========
  // 每个页面的完整定义，key 为页面 ID
  pages: {

    // ---- 页面 01：备忘录 ----
    "01": {
      id: "01",
      title: "备忘录",
      type: "memo",
      data: {
        sections: [
          {
            title: "📘 新手操作指南（来自设计者的帮助）",
            content: "2026年8月13日 10:30\n\n林晓失踪了。你作为她最好的朋友叶禾，拿到了她日常使用的这部手机。警方已经立案，但你总觉得手机里藏着他们发现不了的线索——因为林晓这个人，习惯把秘密藏在没人注意的角落。\n\n请仔细检查这部手机。以下是基本操作方法：\n\n1. 大部分应用都可以点开查看。点不动的地方，按返回键就好。\n2. 主屏幕顶部有一个搜索框。输入关键词可以跳转到对应页面。试试从最明显的地方开始。比如，搜一搜机主的名字，或者你注意到的任何人名、地名等信息。\n3. 你打开过的页面，会自动保存进主屏幕上的「足迹」App。想回看的时候去那里找。\n4. 实在卡住了，就打开 DeepSeek，直接输入页面角落的数字编号，它会给你一些隐晦的提醒。\n\n林晓不是个会轻易消失的人。这部手机里，一定有她留给你的东西。",
            boldKeywords: ["林晓", "叶禾"]
          },
          {
            title: "📝 随手记",
            content: "2026年7月15日 23:42\n\n换了个输入法皮肤。还是九宫格顺手，闭着眼都能打。全键盘老是按错。"
          },
          {
            title: "💡 小说灵感",
            content: "2026年3月2日 02:10\n\n龙会发光。发光的原理是什么？生物电？魔法？先写着，以后圆。"
          },
          {
            title: "🛒 购物清单",
            content: "2026年8月4日 22:15\n\n芒果干（补货）\n充电宝（旧的鼓包了）\n压缩饼干（多买点）\n送叶禾的生日礼物（还没想好）"
          },
          {
            title: "✏️ 编辑的修改意见",
            content: "2026年7月28日 14:30\n\n1. 第三章节奏太拖了，改。\n2. 反派动机再饱满一点。\n3. 交稿日期：下个月10号。"
          }
        ]
      }
    },

    // ---- 页面 02：短信 ----
    "02": {
      id: "02",
      title: "短信",
      type: "sms",
      data: {
        items: [
          { sender: "易存柜", preview: "您的包裹已于2026年8月11日 14:20存入易存柜智能柜。请及时取件。", date: "8月11日", bold: ["易存柜"], fullText: "您的包裹已于2026年8月11日 14:20存入易存柜智能柜。请及时取件。", fullTime: "2026年8月11日 14:20" },
          { sender: "森屿烘焙", preview: "\u3010森屿烘焙\u3011您的生日蛋糕订单已确认！4月15日 11:00-12:00送达\u2026", date: "4月15日", bold: ["森屿烘焙"], fullText: "\u3010森屿烘焙\u3011您的生日蛋糕订单已确认！4月15日 11:00-12:00送达。生日蛋糕（6寸）×1，蜡烛×1，生日帽×1。祝您生日快乐！订单号：SO2026041501。如有变动请联系173xxxx1234。", fullTime: "2026年4月15日 09:00" },
          { sender: "妈妈", preview: "晓晓，腊肉给你放冰箱冷冻层了，记得吃。", date: "8月2日", fullText: "晓晓，腊肉给你放冰箱冷冻层了，记得吃。", fullTime: "2026年8月2日 18:34" },
          { sender: "叶禾", preview: "今晚吃什么，我下班顺路带。", date: "8月1日", fullText: "今晚吃什么，我下班顺路带。", fullTime: "2026年8月1日 17:22" }
        ]
      }
    },

    // ---- 页面 03：笔记-关于叶禾 ----
    "03": {
      id: "03",
      title: "笔记",
      type: "article",
      data: {
        title: "笔记 · 生活素材",
        subtitle: "\uD83D\uDCDD 关于叶禾",
        content: "\uD83C\uDF58 \u7CA5\n\n\u6211\u53D1\u70E7\u90A3\u56DE\uFF0C\u5979\u7FD8\u73ED\u6765\u716E\u7CA5\u3002\n\u7CCA\u4E86\u3002\u9505\u5E95\u90A3\u5C42\u9ED1\u5F97\u53EF\u4EE5\u5F53\u70AD\u7B14\u753B\u7D20\u63CF\u3002\n\u5979\u522E\u4E86\u534A\u5929\uFF0C\u7AEF\u8FC7\u6765\u7684\u65F6\u5019\u8138\u4E0D\u7EA2\u5FC3\u4E0D\u8DF3\uFF1A\n\u201C\u7CCA\u7684\u90A3\u5C42\u6700\u6709\u8425\u517B\u3002\u201D\n\u8BED\u6C14\u8DDF\u5979\u5728\u5929\u6587\u9986\u8BB2\u661F\u5EA7\u4E00\u6837\u6743\u5A01\u3002\n\n\u6211\u5403\u4E86\u3002\u53CD\u6B63\u6211\u6CE1\u9762\u90FD\u80FD\u5FD8\u653E\u8C03\u6599\u5305\uFF0C\u6CA1\u8D44\u683C\u6311\u5254\u3002\n\u800C\u4E14\u7CCA\u7CA5\u6BD4\u6CE1\u9762\u597D\u5403\u3002\u771F\u7684\uFF0C\u4E0D\u662F\u56E0\u4E3A\u611F\u52A8\u624D\u8FD9\u4E48\u8BF4\u7684\u3002\n\u597D\u5427\uFF0C\u6709\u4E00\u70B9\u70B9\u3002\n\n\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n\n\uD83D\uDDE3\uFE0F \u8BDD\u5C11\n\n\u53F6\u79BE\u8BDD\u5C11\u5230\u4EE4\u4EBA\u53D1\u6307\u3002\n\u6211\u8BF4\u201C\u5FD8\u5E26\u94A5\u5319\u4E86\u201D\uFF0C\u5979\u201C\u55EF\u201D\u4E00\u58F0\uFF0C\u7B2C\u4E8C\u5929\u95E8\u57AB\u4E0B\u9762\u591A\u4E86\u628A\u5907\u7528\u94A5\u5319\u3002\n\u6211\u8BF4\u201C\u6CE1\u9762\u53C8\u5FD8\u653E\u8C03\u6599\u5305\u4E86\u201D\uFF0C\u5979\u5468\u672B\u62CE\u4E86\u888B\u8292\u679C\u5E72\u6765\uFF1A\u201C\u8FD9\u4E2A\u4E0D\u7528\u716E\u3002\u201D\n\u4ECE\u5934\u5230\u5C3E\u6CA1\u63D0\u8C03\u6599\u5305\u7684\u4E8B\u3002\n\n\u5979\u5173\u5FC3\u4EBA\u7684\u65B9\u5F0F\u4E0D\u662F\u5B89\u6170\uFF0C\u662F\u628A\u4F60\u4E0B\u6B21\u53EF\u80FD\u72AF\u8821\u7684\u8DEF\u7ED9\u5835\u4E0A\u3002\n\n\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n\n\uD83C\uDFF9\uFE0F \u7BAD\u9986\n\n\u5979\u5728\u7BAD\u9986\u8BA4\u771F\u5F97\u8DDF\u62CD\u7EAA\u5F55\u7247\u4F3C\u7684\u3002\n\u7784\u51C6\u7684\u65F6\u5019\u773C\u775B\u90FD\u4E0D\u7728\uFF0C\u7BAD\u98DE\u51FA\u53BB\uFF0C\u9776\u5FC3\u591A\u4E86\u4E2A\u6D1E\u3002\n\u7136\u540E\u8F6C\u5934\u770B\u6211\uFF1A\u201C\u8FD8\u884C\u3002\u201D\n\u6211\u95EE\u6559\u7EC3\u6536\u9EC4\u4EC0\u4E48\u610F\u601D\u3002\u6559\u7EC3\u8BF4\u5C31\u662F\u5F88\u51C6\u3002\n\u6240\u4EE5\u201C\u8FD8\u884C\u201D\u7684\u610F\u601D\u662F\u2014\u2014\n\u201C\u6211\u4ECA\u5929\u51C6\u5F97\u79BB\u8C31\u4F46\u6211\u4E0D\u4E60\u60EF\u5938\u81EA\u5DF1\u6240\u4EE5\u7528\u8FD8\u884C\u4EE3\u66FF\u3002\u201D\n\u53F6\u6C0F\u8C26\u865A\u6CD5\u3002\u884C\u5427\u3002\n\n\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n\n\u2604\uFE0F \u7EA6\u5B9A\n\n\u53CC\u5B50\u5EA7\u6D41\u661F\u96E8\uFF0C\u7EA6\u4E86\u4E09\u5E74\uFF0C\u6211\u9E3D\u4E86\u4E09\u5E74\u3002\n\u7B2C\u4E00\u5E74\u662F\u8D77\u4E0D\u6765\u3002\u7B2C\u4E8C\u5E74\u662F\u95F9\u949F\u6CA1\u54CD\u3002\u7B2C\u4E09\u5E74\u8D76\u7A3F\u5230\u51CC\u6668\u4E09\u70B9\uFF0C\u9192\u8FC7\u6765\u5DF2\u7ECF\u5929\u4EAE\u4E86\u3002\n\u5979\u6BCF\u6B21\u90FD\u7B49\u3002\u6BCF\u6B21\u90FD\u8BF4\u201C\u660E\u5E74\u4E00\u5B9A\u201D\u3002\n\u4E0D\u662F\u62B1\u6028\u3002\u5C31\u662F\u90A3\u79CD\u2014\u2014\u884C\uFF0C\u90A3\u5C31\u660E\u5E74\u3002\n\n\u6240\u4EE5\u4ECA\u5E74\u8BF4\u4EC0\u4E48\u4E5F\u5F97\u53BB\u3002\u5B9A\u5341\u4E2A\u95F9\u949F\u3002\n\u5979\u751F\u65E5\u9644\u8FD1\uFF0C\u6D41\u91CF\u6781\u5927\u3002\u8292\u679C\u5E72\u5DF2\u5907\u597D\u3002\u622A\u56FE\u4E86\u3002\n\n\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n\n\u23F0 \u6211\u5FD8\u5E26\u4E1C\u897F\u7684\u65E5\u5E38\n\n\u4ECA\u5929\u51FA\u95E8\u53C8\u5FD8\u5E26\u94A5\u5319\u3002\u5728\u95E8\u53E3\u7AD9\u4E86\u5341\u5206\u949F\u7B49\u5F00\u9501\u5E08\u5085\u3002\n\u4E0A\u4E2A\u6708\u5FD8\u5E26\u624B\u673A\u3002\u5979\u8BF4\u201C\u4E0D\u4E00\u6837\u201D\u3002\n\u786E\u5B9E\u4E0D\u4E00\u6837\u3002\u4E0A\u4E2A\u6708\u662F\u624B\u673A\uFF0C\u8FD9\u4E2A\u6708\u662F\u94A5\u5319\uFF0C\u4E0B\u4E2A\u6708\u53EF\u80FD\u662F\u81EA\u5DF1\u3002\n\u5979\u8BA9\u6211\u628A\u81EA\u5DF1\u5FD8\u4E86\u7B97\u4E86\u3002\u6211\u8BF4\u4E5F\u4E0D\u662F\u6CA1\u53EF\u80FD\u3002\n\u5979\u53F9\u6C14\u7684\u65F6\u5019\u5634\u89D2\u662F\u5F2F\u7684\u3002\u6211\u770B\u89C1\u4E86\u3002\n\n\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n\n\uD83C\uDF81 \u793C\u7269\n\n\u9001\u5979\u4E00\u679A\u91D1\u5E01\u3002\u4ECE\u90A3\u8FB9\u5E26\u56DE\u6765\u7684\u3002\u54AC\u4E86\uFF0C\u8F6F\u7684\uFF0C\u771F\u91D1\u3002\n\u5979\u8001\u7B11\u6211\u66B4\u5BCC\u68A6\uFF0C\u7ED9\u5979\u4E00\u679A\u771F\u7684\uFF0C\u8BA9\u5979\u611F\u53D7\u4E00\u4E0B\u4EC0\u4E48\u53EB\u8BF4\u5230\u505A\u5230\u3002\n\u5176\u5B9E\u662F\u89C9\u5F97\u597D\u770B\u3002\u91D1\u8272\u886C\u5979\u3002\n\n\u884C\u4E86\u4E0D\u5199\u4E86\uFF0C\u8D8A\u5199\u8D8A\u50CF\u6BD5\u4E1A\u7EAA\u5FF5\u518C\u3002\n\u53CD\u6B63\u5979\u4E0D\u4F1A\u770B\u5230\u3002\u9664\u975E\u54EA\u5929\u6211\u624B\u673A\u843D\u5979\u5BB6\u3002\n\u7B49\u4F1A\u513F\uFF0C\u6211\u624B\u673A\u597D\u50CF\u771F\u7684\u7ECF\u5E38\u5FD8\u5E26\u2014\u2014\n\u7B97\u4E86\u3002",
        bold: [],
        footerNote: ""
      }
    },

    // ---- 页面 04：日历 ----
    "05": {
      id: "05",
      title: "日历",
      type: "calendar",
      data: {
        year: 2026,
        month: 8,
        marked: { 11: "准备叶禾的生日礼物", 20: "叶禾生日" }
      }
    },

    // ---- 页面 06：微信消息列表 ----
    "06": {
      id: "06",
      title: "微信",
      type: "wechat-list",
      data: {
        chatList: [
          { name: "禾你一起看星星", avatar: "⭐", preview: "截图了。", date: "8月12日", target: "07" },
          { name: "暴躁小鹿", avatar: "🦌", preview: "万一哪天用得上。", date: "8月10日", target: "07" },
          { name: "妈妈", avatar: "👩", preview: "你自己去谢。", date: "8月10日", target: "07" }
        ]
      }
    },

    // ---- 页面 04：电话 ----
    "04": {
      id: "04",
      title: "电话",
      type: "phone",
      data: {
        tabs: ["联系人", "通话记录"],
        contacts: [
          { name: "妈妈", phone: "139 1234 5678" },
          { name: "叶禾", phone: "158 8765 4321" },
          { name: "路晏", phone: "177 2345 6789" }
        ],
        callHistory: [
          { name: "叶禾", date: "2026年8月13日 08:12", detail: "未接来电（3次）", missed: true },
          { name: "叶禾", date: "2026年8月12日 19:45", detail: "未接来电", missed: true },
          { name: "叶禾", date: "2026年8月12日 16:30", detail: "未接来电", missed: true },
          { name: "叶禾", date: "2026年8月11日 21:30", detail: "通话时长 12分07秒 ✓", missed: false },
          { name: "妈妈", date: "2026年8月10日 19:23", detail: "通话时长 3分21秒 ✓", missed: false },
          { name: "路晏", date: "2026年8月9日 16:15", detail: "通话时长 2分03秒 ✓", missed: false },
          { name: "叶禾", date: "2026年8月1日 14:22", detail: "通话时长 5分43秒 ✓", missed: false },
          { name: "妈妈", date: "2026年7月28日 14:05", detail: "未接来电", missed: true },
          { name: "叶禾", date: "2026年7月20日 20:15", detail: "通话时长 8分30秒 ✓", missed: false },
          { name: "叶禾", date: "2026年5月1日 11:08", detail: "通话时长 3分12秒 ✓", missed: false }
        ],
        ownNumber: "138 0561 8823"
      }
    },

    // ---- 页面 07：微信 ----
    "07": {
      id: "07",
      title: "微信",
      type: "wechat-chat",
      data: {
        defaultChat: "禾你一起看星星",
        conversations: {
          "禾你一起看星星": [
            { time: "2026年7月28日 09:15", messages: [
              { role: "self", name: "禾你一起看星星", text: "今天出门又忘带钥匙。在门口站了十分钟等开锁师傅。" },
              { role: "other", name: "林晓", text: "你上个月不是刚忘过。" },
              { role: "self", name: "禾你一起看星星", text: "上个月是忘带手机。不一样。" },
              { role: "other", name: "林晓", text: "……你下次把自己忘家里算了。" },
              { role: "self", name: "禾你一起看星星", text: "也不是没可能。" }
            ]},
            { time: "2026年8月3日 12:40", messages: [
              { role: "self", name: "禾你一起看星星", text: "救命，我今天煮泡面忘了放调料包。" },
              { role: "other", name: "林晓", text: "你怎么不把自己忘了。" },
              { role: "self", name: "禾你一起看星星", text: "在努力了。" }
            ]},
            { time: "2026年7月25日 20:30", messages: [
              { role: "other", name: "林晓", text: "八月英仙座流星雨，八月二十号前后极大。正好我生日那几天。出来看不？" },
              { role: "self", name: "禾你一起看星星", text: "看。但我可能起不来。" },
              { role: "other", name: "林晓", text: "流星雨是晚上看的。不用早起。" },
              { role: "self", name: "禾你一起看星星", text: "晚上我也起不来。" },
              { role: "other", name: "林晓", text: "你是冬眠吗。" },
              { role: "self", name: "禾你一起看星星", text: "我是洞穴生物。需要被芒果干引诱才出洞。" },
              { role: "other", name: "林晓", text: "成交。芒果干管够。你给我出来。" },
              { role: "self", name: "禾你一起看星星", text: "截图了。" }
            ]}
          ],
          "暴躁小鹿": [
            { time: "2026年8月12日 14:30", messages: [
              { role: "other", name: "暴躁小鹿", text: "【小红书链接】救命这个帖子笑死我了，现在设密码真的好难" },
              { role: "self", name: "林晓", text: "哈哈哈哈笑死，设个密码比写小说还难" },
              { role: "other", name: "暴躁小鹿", text: "所以你现在都用什么密码" },
              { role: "self", name: "林晓", text: "我就那几个来回用，记不住复杂的" }
            ]},
            { time: "2026年8月10日 16:45", messages: [
              { role: "other", name: "暴躁小鹿", text: "周末去野餐，我带椰子冻，你不是喜欢椰子味吗？" },
              { role: "self", name: "林晓", text: "椰子味可以，但我对椰子本身过敏！一吃就起疹子，别带啦。", bold: true },
              { role: "other", name: "暴躁小鹿", text: "好吧好吧，那带芒果干总行了吧？" },
              { role: "self", name: "林晓", text: "行啊。" },
              { role: "other", name: "暴躁小鹿", text: "烦死了每次组局就我最操心。你俩倒是主动提点东西啊。" },
              { role: "self", name: "林晓", text: "你比较厉害嘛。能者多劳🥭" }
            ]},
            { time: "2026年8月10日 10:20", messages: [
              { role: "other", name: "暴躁小鹿", text: "【B站链接】这个露营装备开箱看得我有点心动，你不是说要买大箱子装你那些户外杂物吗" },
              { role: "self", name: "林晓", text: "我已经买了！给你看【发送淘宝链接】" },
              { role: "other", name: "暴躁小鹿", text: "嚯，还真买了。你不是说只是采风吗，买露营箱干嘛" },
              { role: "self", name: "林晓", text: "采风也要有仪式感。再说万一哪天想露营呢" },
              { role: "other", name: "暴躁小鹿", text: "行吧行吧。下次露营叫我，我负责带吃的，你负责搭帐篷" },
              { role: "self", name: "林晓", text: "成交🏕️" }
            ]}
          ],
          "妈妈": [
            { time: "2026年8月10日 19:30", messages: [
              { role: "other", name: "妈妈", text: "晓晓，吃饭了没？别老吃泡面。" },
              { role: "self", name: "林晓", text: "吃了麻辣烫。" },
              { role: "other", name: "妈妈", text: "麻辣烫也算泡面亲戚。下个月我回去，给你带腊肉。" },
              { role: "self", name: "林晓", text: "好嘞！腊肉焖饭！" }
            ]},
            { time: "2026年7月28日 14:30", messages: [
              { role: "other", name: "妈妈", text: "你表姐生了，女孩，六斤三两。让你帮忙想名字。" },
              { role: "self", name: "林晓", text: "我起名都是翻字典的。" },
              { role: "other", name: "妈妈", text: "翻字典也比她老公起的\u201c王美丽\u201d强。" },
              { role: "self", name: "林晓", text: "……行，我想想。" }
            ]},
            { time: "2026年6月20日 11:15", messages: [
              { role: "other", name: "妈妈", text: "家里那盆绿萝你还浇水吗。" },
              { role: "self", name: "林晓", text: "忘了。它还活着吗。" },
              { role: "other", name: "妈妈", text: "还活着。叶禾妈妈上次来帮忙浇了。" },
              { role: "self", name: "林晓", text: "帮我谢谢阿姨。" },
              { role: "other", name: "妈妈", text: "你自己去谢。" }
            ]}
          ]
        },
        // 链接跳转
        links: {
          "暴躁小鹿": {
            "小红书链接": "28",
            "淘宝链接": "09>08",
            "B站链接": "25>24"
          }
        }
      }
    },

    // ---- 页面 08：淘宝露营箱 ----
    "08": {
      id: "08",
      title: "商品详情",
      type: "product",
      data: {
        name: "露营箱 大容量便携款 户外折叠收纳箱 车载储物箱",
        price: "¥189",
        sales: "月销2000+",
        shipping: "免运费",
        specSelected: "65L / 环保PP塑料 / 58×38×32cm",
        details: [
          { label: "容量", value: "65L" },
          { label: "材质", value: "环保PP塑料" },
          { label: "尺寸", value: "58×38×32cm" },
          { label: "承重", value: "80kg" },
          { label: "特点", value: "可折叠，带滑轮" }
        ],
        reviews: [
          { user: "l***8", text: "箱子挺结实的，露营用过一次，装帐篷睡袋绰绰有余。", likes: "👍128" },
          { user: "芒***中", text: "做工不错，滑轮顺滑。下次露营试试看。", likes: "👍56" }
        ]
      }
    },

    // ---- 页面 09：淘宝订单 ----
    "10": {
      id: "10",
      title: "我的订单",
      type: "order-list",
      data: {
        groups: [
          {
            month: "2026年8月",
            items: [
              { name: "防水背包(65L)", price: "¥289", date: "8/11", status: "交易成功" },
              { name: "硫磺粉×2", price: "¥38", date: "8/10", status: "交易成功" },
              { name: "能量棒×12", price: "¥78", date: "8/10", status: "交易成功" },
              { name: "净水药片", price: "¥45", date: "8/10", status: "交易成功" },
              { name: "头灯", price: "¥89", date: "8/10", status: "交易成功" },
              { name: "速干衣裤×2", price: "¥198", date: "8/10", status: "交易成功" },
              { name: "露营箱", price: "¥189", date: "8/10", status: "交易成功" },
              { name: "多功能工兵铲", price: "¥79", date: "8/9", status: "交易成功" },
              { name: "防水打火石×3", price: "¥39", date: "8/8", status: "交易成功" },
              { name: "急救包", price: "¥128", date: "8/7", status: "交易成功" },
              { name: "压缩饼干×10", price: "¥89", date: "8/6", status: "交易成功" },
              { name: "户外净水器", price: "¥156", date: "8/5", status: "交易成功" }
            ]
          },
          {
            month: "2026年7月",
            items: [
              { name: "便携充电宝×2", price: "¥158", date: "", status: "交易成功" },
              { name: "芒狗芒果干×3", price: "¥89", date: "", bold: true, status: "交易成功" },
              { name: "防潮睡袋", price: "¥135", date: "", status: "交易成功" }
            ]
          },
          {
            month: "2026年6月",
            items: [
              { name: "多肉植物专用土", price: "¥23", date: "", status: "交易成功" },
              { name: "芒狗芒果干×2", price: "¥59", date: "", bold: true, status: "交易成功" }
            ]
          },
          {
            month: "2026年5月",
            items: [
              { name: "泡面碗", price: "¥35", date: "", status: "交易成功" },
              { name: "懒人筷子", price: "¥19", date: "", status: "交易成功" },
              { name: "芒狗芒果干×2", price: "¥59", date: "", bold: true, status: "交易成功" }
            ]
          },
          {
            month: "2026年4月",
            items: [
              { name: "芒狗芒果干×3", price: "¥89", date: "", bold: true, status: "交易成功" }
            ]
          },
          {
            month: "2026年3月",
            items: [
              { name: "《奇幻世界构建》等5本", price: "¥216", date: "", status: "交易成功" },
              { name: "芒狗芒果干×1", price: "¥29", date: "", bold: true, status: "交易成功" }
            ]
          }
        ]
      }
    },

    // ---- 页面 10：DeepSeek ----
    "11": {
      id: "11",
      title: "DeepSeek",
      type: "chat",
      data: {
        messages: [
          { role: "user", text: "\u6211\u542C\u5230\u4E00\u4E2A\u8BCD\uFF0C\u53D1\u97F3\u50CF\u201C\u8DEF\u7C73\u7EB3\u5C14\u201D\u3002lu-mi-na-er\u3002\u5927\u6982\u662F\u8FD9\u6837\u3002\u80FD\u5E2E\u6211\u67E5\u4E00\u4E0B\u8FD9\u662F\u4EC0\u4E48\u8BED\u8A00\u3001\u4EC0\u4E48\u610F\u601D\u5417\uFF1F", date: "2025\u5E7410\u670815\u65E5 23:42" },
          { role: "ai", text: "\u6839\u636E\u60A8\u63CF\u8FF0\u7684\u53D1\u97F3\uFF0C\u8FD9\u4E2A\u8BCD\u5F88\u53EF\u80FD\u662F\u62C9\u4E01\u8BED\u201CLuminar\u201D\uFF0C\u6E90\u4E8E\u201Clumen\u201D\uFF08\u610F\u4E3A\u201C\u5149\u201D\uFF09\u3002\u62FC\u5199\u4E3A L-U-M-I-N-A-R\uFF0C\u610F\u601D\u662F\u201C\u5149\u201D\u6216\u201C\u53D1\u5149\u4F53\u201D\u3002", date: "2025\u5E7410\u670815\u65E5 23:42" }
        ],
        inputPlaceholder: "输入页面编号获取提示..."
      }
    },

    // ---- 页面 11：浏览器搜索"林晓" ----
    "12": {
      id: "12",
      title: "搜索结果",
      type: "browser-search",
      data: {
        query: "林晓",
        url: "www.baidu.com",
        results: [
          { title: "林晓（百度百科）", summary: "林晓，青年冒险小说作家。代表作《辉光记》…", source: "baike.baidu.com", target: "13", clickable: true },
          { title: "林晓：遇见文字，遇见冒险 - 人物专访", summary: "\u201c2022年，林晓出版了第一本冒险小说《辉光记》。她说：发表第一本书那天，是我这辈子最难忘的一天。\u201d", source: "文艺周刊", target: "14", clickable: true }
        ],
        relatedSearches: ["林晓 辉光记", "青年作家 林晓", "冒险小说 推荐"],
        trendingSearches: ["辉光记 读后感", "林晓 新书", "冒险小说 排行榜"]
      }
    },

    // ---- 页面 12：百科-林晓 ----
    "13": {
      id: "13",
      title: "林晓",
      type: "article",
      data: {
        title: "林晓",
        content: "林晓，中国当代青年作家，以冒险小说见长。\n\n已出版作品：\n·《辉光记》（2022年6月12日）\n·《星渊手札》（2023年10月）\n·《风蚀城》（2025年3月）\n\n文风奇幻瑰丽，擅长构建非现实世界观。",
        bold: ["《辉光记》（2022年6月12日）"]
      }
    },

    // ---- 页面 13：专访-林晓 ----
    "14": {
      id: "14",
      title: "遇见文字，遇见冒险",
      type: "article",
      data: {
        title: "遇见文字，遇见冒险",
        content: "2022年，当时还名不见经传的林晓出版了第一本小说《辉光记》。我们约在一家安静的咖啡馆见面，她点了一杯热可可，说咖啡太苦。\n\n\"发表第一本书那天，是我这辈子最难忘的一天。\"她笑着说，\"不是因为书卖了多少，是因为我终于证明了自己不是在瞎做梦。\"\n\n问她为什么选择冒险题材，她想了想，说：\"大概是因为，我总觉得现实世界之外还有别的世界。写出来，就像真的去过一样。\"",
        bold: ["发表第一本书那天，是我这辈子最难忘的一天。"]
      }
    },

    // ---- 页面 14：QQ登录 ----
    "15": {
      id: "15",
      title: "QQ",
      type: "login",
      data: {
        accountPlaceholder: "请输入手机号",
        passwordPlaceholder: "请输入密码",
        account: "13805618823",
        accountType: "phone",
        password: "20220612",
        passwordKey: "qq",
        securityQuestion: "你最难忘的一天是？",
        securityAnswer: "20220612",
        successTarget: "16"
      }
    },

    // ---- 页面 16：林晓QQ空间主页 ----
    "16": {
      id: "16",
      title: "QQ空间-林晓主页",
      type: "qq-space",
      data: {
        nickname: "芒狗今天暴富了吗",
        signature: "努力赚钱，早日退休。",
        pinnedRepost: null,
        journals: [
          {
            title: "新小说主角名字定了",
            date: "2025年9月",
            locked: true,
            lockLabel: "🔒 私密日志",
            securityQuestion: "我最爱的零食品牌是？（拼音）",
            securityAnswer: "manggou",
            content: "新小说主角名字定了：艾洛蒂（Elodie）。一条蓝色的龙。\n写龙好难哦，但写出来应该会很好看吧。"
          }
        ],
        posts: [
          { text: "欢乐谷年卡用户报到！！🎢", date: "2025年5月1日" },
          { text: "坐了三次过山车。@禾你一起看星星 吐了两次。笑死。", date: "2025年8月13日", mentionTarget: "17",
            replies: [
              { user: "禾你一起看星星", text: "明年再也不跟你来了", isReply: true },
              { user: "芒狗今天暴富了吗", text: "你去年也这么说", isReply: true }
            ]
          },
          { text: "快递八个……我是买了什么", date: "2026年3月" },
          { text: "编辑又在催稿了救", date: "2026年2月" },
          { text: "下雨天和躺平最配", date: "2025年11月" },
          { text: "新年愿望：暴富", date: "2026年1月1日" }
        ],
        albums: []
      }
    },

    // ---- 页面 17：叶禾QQ空间主页 ----
    "17": {
      id: "17",
      title: "\u79BE\u4F60\u4E00\u8D77\u770B\u661F\u661F",
      type: "qq-space",
      data: {
        nickname: "\u79BE\u4F60\u4E00\u8D77\u770B\u661F\u661F",
        signature: "\u62AC\u5934\u770B\u661F\u661F\u7684\u65F6\u5019\uFF0C\u70E6\u607C\u90FD\u5F88\u5C0F\u3002",
        pinnedRepost: {
          title: "\u6BCF\u5C0F\u65F6150\u9897\uFF012026\u53CC\u5B50\u5EA7\u6D41\u661F\u96E8\u6216\u8FCE\u53F2\u8BD7\u7EA7\u7206\u53D1",
          comment: "\u548C\u67D0\u4EBA\u7EA6\u4E86\u4E09\u5E74\u90FD\u6CA1\u770B\u6210\u3002",
          date: "2026\u5E747\u6708",
          fullContent: "\u53CC\u5B50\u5EA7\u6D41\u661F\u96E8\uFF08Geminids\uFF09\u662F\u5168\u5E74\u6700\u7A33\u5B9A\u7684\u6D41\u661F\u96E8\u4E4B\u4E00\uFF0C\u6D3B\u8DC3\u671F\u4E3A\u6BCF\u5E7412\u67084\u65E5\u81F317\u65E5\uFF0C2026\u5E74\u6781\u5927\u9884\u8BA1\u51FA\u73B0\u572812\u670813-14\u65E5\u3002\u8F90\u5C04\u70B9\u4F4D\u4E8E\u53CC\u5B50\u5EA7\uFF08Gemini\uFF09\u9644\u8FD1\uFF0C\u6D41\u661F\u901F\u5EA6\u4E2D\u7B49\uFF0C\u989C\u8272\u504F\u767D\uFF0C\u5076\u6709\u4EAE\u6D41\u661F\u548C\u706B\u6D41\u661F\u3002\n\n\u4ECA\u5E74\u7684\u89C2\u6D4B\u6761\u4EF6\u5341\u5206\u96BE\u5F97\uFF1A\u6781\u5927\u671F\u95F4\u6070\u9022\u86FE\u7709\u6708\uFF0C\u6708\u5149\u5E72\u6270\u6781\u5C0F\uFF0C\u9884\u8BA1\u6BCF\u5C0F\u65F6\u8D85\u8FC7100\u9897\u6D41\u661F\u7684\u5F3A\u52B2\u6D41\u91CF\u53EF\u6301\u7EED10\u81F312\u5C0F\u65F6\uFF0C\u662F\u5168\u5E74\u6700\u503C\u5F97\u671F\u5F85\u7684\u5929\u8C61\u76DB\u5BB4\u3002\n\n\u89C2\u6D4B\u5EFA\u8BAE\uFF1A\u8FDC\u79BB\u57CE\u5E02\u5149\u6C61\u67D3\uFF0C\u4E0D\u9700\u8981\u4EFB\u4F55\u8BBE\u5907\uFF0C\u8089\u773C\u5373\u53EF\u89C2\u8D4F\u3002\u8EBA\u7740\u770B\uFF0C\u5E26\u591F\u8863\u670D\uFF0C\u5E26\u591F\u96F6\u98DF\u3002\u6700\u4F73\u89C2\u6D4B\u65F6\u95F4\u662F\u51CC\u66682\u70B9\u52305\u70B9\u3002",
          boldKeywords: ["\uFF08Gemini\uFF09"],
          replies: [
            { user: "\u8292\u72D7\u4ECA\u5929\u66B4\u5BCC\u4E86\u5417", text: "\u90A3\u6211\u4EEC\u5C31\u662F\u53CC\u5B50\u661F\u2728" },
            { user: "\u8292\u72D7\u4ECA\u5929\u66B4\u5BCC\u4E86\u5417", text: "\u94A5\u5319\u6211\u541E\u4E86 \u8FD9\u8F88\u5B50\u522B\u60F3\u89E3\u7ED1" },
            { user: "\u79BE\u4F60\u4E00\u8D77\u770B\u661F\u661F", text: "\u4F60\u541E\u94A5\u5319\u5E72\u561B\u554A\u4F60", isReply: true }
          ]
        },
        journals: [],
        posts: [
          { text: "天蝎座心宿二。太亮了！！夏天快来吧。", date: "2026年4月" },
          { text: "\u624B\u673A\u952E\u76D8\u8FD8\u662F\u4E5D\u5BAB\u683C\u597D\u7528\uFF0C\u5168\u952E\u76D8\u624B\u6307\u592A\u7C97\u8001\u662F\u6309\u9519\u3002", date: "2026\u5E743\u6708",
            replies: [
              { user: "\u8292\u72D7\u4ECA\u5929\u66B4\u5BCC\u4E86\u5417", text: "\u5C31\u662F\u5C31\u662F\uFF01\uFF01\u800C\u4E14\u4E5D\u5BAB\u683C\u6253\u51FA\u6765\u7684\u6570\u5B57\u8FD8\u80FD\u5F53\u5BC6\u7801\u7528 \u7279\u597D\u4F7F", bold: true },
              { user: "\u79BE\u4F60\u4E00\u8D77\u770B\u661F\u661F", text: "\u4F60\u53C8\u62FF\u8FD9\u62DB\u8BBE\u4EC0\u4E48\u5BC6\u7801\u4E86", isReply: true },
              { user: "\u8292\u72D7\u4ECA\u5929\u66B4\u5BCC\u4E86\u5417", text: "\u79D8\u5BC6\u634F\ud83e\udd0f", isReply: true }
            ]
          },
          { text: "\u7BAD\u9986\u5C04\u7BAD\uFF0C\u4ECA\u5929\u624B\u611F\u4E0D\u9519\u3002\u6211\u4E0D\u6253\u5154\u5B50\uFF0C\u6211\u6253\u661F\u661F\u3002", date: "2025\u5E748\u6708" },
          { text: "\u6BCD\u4EB2\u7684\u730E\u67AA\u4E0E\u7948\u798F\u8BED\u5F55\u3002\u5979\u8BF4\uFF0C\u63E1\u67AA\u7684\u65F6\u5019\u5FC3\u91CC\u5FF5\u4E00\u904D\uFF0C\u5B50\u5F39\u4F1A\u627E\u5230\u56DE\u5BB6\u7684\u8DEF\u3002", date: "2022\u5E748\u6708" }
        ],
        albums: [
          { title: "\u300A\u65E7\u7269\u300B", caption: "\u91CC\u9762\u6709\u628A\u730E\u67AA\uFF0C\u6211\u4E5F\u6CA1\u94A5\u5319\u3002", image: "old_cabinet" }
        ]
      }
    },

    // ---- 页面 18：微博登录 ----
    "18": {
      id: "18",
      title: "微博",
      type: "login",
      data: {
        accountPlaceholder: "请输入手机号",
        passwordPlaceholder: "密码",
        account: "13805618823",
        accountType: "phone",
        password: "20040415",
        passwordKey: "weibo",
        securityQuestion: "我的生日是？（8位数字）",
        securityAnswer: "20040415",
        successTarget: "19"
      }
    },

    // ---- 页面 19：微博-叶禾主页 ----
    // ---- 页面 19：微博-林晓作家大号主页 ----
    "19": {
      id: "19",
      title: "\u6797\u6653",
      type: "weibo-profile",
      data: {
        nickname: "\u6797\u6653",
        bio: "\u9752\u5E74\u4F5C\u5BB6\uFF0C\u4EE3\u8868\u4F5C\u300A\u8F89\u5149\u8BB0\u300B\u300A\u661F\u6E0A\u624B\u624E\u300B\u300A\u98CE\u8680\u57CE\u300B\u3002\n\u52AA\u529B\u8D5A\u94B1\uFF0C\u65E9\u65E5\u9000\u4F11\u3002",
        posts: [
          { date: "3\u670818\u65E5 10:30", text: "\u8F6C\u53D1 // @\u65B0\u661F\u51FA\u7248\u793E\uFF1A@\u6797\u6653 \u7684\u65B0\u4E66\u300A\u98CE\u8680\u57CE\u300B\u5165\u90092025\u5E74\u5EA6\u5192\u9669\u5C0F\u8BF4\u63A8\u8350\u699C\uFF01\u6C99\u6F20\u53E4\u57CE\u7684\u79D8\u5BC6\u7B49\u4F60\u53D1\u73B0\u3002" },
          { date: "2\u670815\u65E5 22:47", text: "\u65B0\u4E66\u5199\u5230\u7B2C\u4E09\u7AE0\u5361\u4F4F\u4E86\u3002\u7F16\u8F91\u8BF4\u4E0B\u4E2A\u670810\u53F7\u4EA4\u7A3F\u3002\u73B0\u5728\u8FDE\u4E3B\u89D2\u540D\u5B57\u90FD\u60F3\u6539\u3002",
            comments: [
              { user: "\u79BE\u4F60\u4E00\u8D77\u770B\u661F\u661F", text: "\u4E3B\u89D2\u540D\u5B57\u6539\u591A\u5C11\u7248\u4E86\uFF0C\u522B\u6539\u4E86\u5148\u5199\u5B8C\u3002" },
              { user: "\u6797\u6653", text: "\u4F60\u4E0D\u61C2\uFF0C\u540D\u5B57\u5B9A\u4E86\u4E00\u5207\u90FD\u5B9A\u4E86\u3002", isReply: true }
            ]
          },
          { date: "1\u67088\u65E5 14:22", text: "\u8F6C\u53D1 // @\u4F5C\u5BB6\u5468\u91CE\uFF1A\u4ECA\u5929\u804A\u5230\u5947\u5E7B\u4E16\u754C\u7684\u6784\u5EFA\uFF0C@\u6797\u6653 \u7684\u89C2\u70B9\u8BA9\u6211\u53D7\u76CA\u826F\u591A\u3002\u5192\u9669\u5C0F\u8BF4\u7684\u6838\u5FC3\u4E0D\u662F\u5947\u89C2\uFF0C\u662F\u4EBA\u5728\u5947\u89C2\u9762\u524D\u7684\u53CD\u5E94\u3002" },
          { date: "2025\u5E7412\u670820\u65E5 19:15", text: "\u300A\u8F89\u5149\u8BB0\u300B\u52A0\u5370\u4E86\u3002\u7F16\u8F91\u8BF4\u201C\u5C0F\u5C0F\u5E86\u795D\u4E00\u4E0B\u201D\u3002\u6211\u4E70\u4E86\u4E00\u7BB1\u8292\u679C\u5E72\u3002",
            comments: [
              { user: "\u79BE\u4F60\u4E00\u8D77\u770B\u661F\u661F", text: "\u8292\u679C\u5E72\u6BD4\u5199\u4E66\u91CD\u8981\u3002" },
              { user: "\u6797\u6653", text: "\u786E\u5B9E\u3002", isReply: true }
            ]
          },
          { date: "2025\u5E7410\u67085\u65E5 01:12", text: "\u5199\u7A3F\u5199\u5230\u51CC\u66683\u70B9\uFF0C\u6CE1\u9762\u5FD8\u4E86\u653E\u8C03\u6599\u5305\u3002\u5403\u5B8C\u624D\u53D1\u73B0\u3002\u8FD9\u5C31\u662F\u6211\u7684\u5199\u4F5C\u72B6\u6001\u3002" }
        ],
        sidebar: [
          { text: "\u53EF\u80FD\u8BA4\u8BC6\u7684\u4EBA", name: "\u79BE\u4F60\u4E00\u8D77\u770B\u661F\u661F", bold: false, clickable: false },
          { text: "", name: "\u827E\u5C14\u8BFA\u62C9\u5192\u9669\u961F\u961F\u957F", bold: true, clickable: true, target: "20" }
        ]
      }
    },

    // ---- 页面 20：微博-林晓小号主页（锁定状态） ----
    "20": {
      id: "20",
      title: "\u827E\u5C14\u8BFA\u62C9\u5192\u9669\u961F\u961F\u957F",
      type: "weibo-locked",
      data: {
        nickname: "\u827E\u5C14\u8BFA\u62C9\u5192\u9669\u961F\u961F\u957F",
        bio: "\u8BB0\u5F55\u4E00\u4E9B\u5947\u602A\u7684\u68A6\uFF0C\u8BF4\u4E0D\u5B9A\u80FD\u5199\u6210\u5C0F\u8BF4\u7D20\u6750",
        loginTarget: "21"
      }
    },

    // ---- 页面 20B：微博-林晓小号登录页 ----
    "21": {
      id: "21",
      title: "\u767B\u5F55",
      type: "login",
      data: {
        accountPlaceholder: "\u8D26\u53F7",
        passwordPlaceholder: "\u5BC6\u7801",
        account: "\u827E\u5C14\u8BFA\u62C9\u5192\u9669\u961F\u961F\u957F",
        password: "cynthia",
        accountReadonly: true,
        passwordKey: "weibo_private",
        securityQuestion: "\u53CC\u6708\u540D\u5B57\uFF08\u82F1\u6587\uFF09",
        securityAnswer: "cynthia",
        successTarget: "22"
      }
    },

    // ---- 页面 20A：微博-林晓小号完整内容页 ----
    "22": {
      id: "22",
      title: "\u827E\u5C14\u8BFA\u62C9\u5192\u9669\u961F\u961F\u957F",
      type: "weibo-private",
      data: {
        nickname: "\u827E\u5C14\u8BFA\u62C9\u5192\u9669\u961F\u961F\u957F",
        bio: "\u8BB0\u5F55\u4E00\u4E9B\u5947\u602A\u7684\u68A6\uFF0C\u8BF4\u4E0D\u5B9A\u80FD\u5199\u6210\u5C0F\u8BF4\u7D20\u6750",
        posts: [
          { date: "2026\u5E748\u670813\u65E5 01:02", text: "\u88C5\u5907\u4E70\u9F50\u4E86\u3002\u5E0C\u671B\u7528\u4E0D\u4E0A\uFF0C\u4F46\u4E07\u4E00\u7528\u5F97\u4E0A\u2014\u2014\u5148\u5907\u7740\u5427\u3002\u6211\u9700\u8981\u88C5\u5907\uFF0C\u4E5F\u9700\u8981\u4E00\u70B9\u8FD0\u6C14\u3002" },
          { date: "2026\u5E748\u670810\u65E5", text: "\u8F6C\u53D1 // @\u624B\u5DE5\u803F\u54E5\uFF1A\u81EA\u5236\u91CE\u5916\u51C0\u6C34\u5668\uFF0C\u6210\u672C\u4E0D\u523020\u5757\u3002" },
          { date: "2026\u5E748\u67085\u65E5", text: "\u4ECA\u5929\u5403\u5230\u4E86\u8D85\u597D\u5403\u7684\u8292\u679C\u5E72\uFF0C\u5E78\u798F\u5230\u6D41\u6CEA\u3002" },
          { date: "2026\u5E747\u670828\u65E5 02:33", text: "\u8FDE\u7EED\u597D\u51E0\u5929\u90FD\u5728\u505A\u90A3\u8FB9\u7684\u68A6\u3002\u98CE\u3001\u5149\u3001\u8352\u539F\u3002" },
          { date: "2026\u5E747\u670820\u65E5", text: "\u8F6C\u53D1 // @\u661F\u5EA7\u8FD0\u52BF\uFF1A\u516B\u6708\u82F1\u4ED9\u5EA7\u6D41\u661F\u96E8\uFF0C\u8BB8\u613F\u6307\u5357\u3002" },
          { date: "2026\u5E747\u670821\u65E5 03:51", text: "\u68A6\u89C1\u90A3\u6761\u9F99\u53D7\u4F24\u4E86\u3002\u4E09\u5934\u9ED1\u9CDE\u9F99\u56F4\u7740\u5B83\u3002\u6211\u51B2\u8FC7\u53BB\u558A\u4E86\u4E00\u4E2A\u8BCD\uFF0C\u5B83\u7684\u9CDE\u7247\u7206\u51FA\u597D\u4EAE\u7684\u5149\u3002\u6211\u5F97\u56DE\u53BB\u3002" },
          { date: "2026\u5E747\u670815\u65E5 23:47", text: "\u68A6\u5230\u4E00\u53EA\u94F6\u8272\u7684\u732B\uFF0C\u5728\u96C6\u5E02\u5077\u5403\u4E00\u79CD\u53D1\u5149\u7684\u679C\u5B50\u3002\u6211\u5E2E\u5B83\u85CF\u4E86\u8D77\u6765\uFF0C\u5B83\u7528\u8111\u888B\u8E6D\u6211\u7684\u624B\u3002\u90A3\u53EA\u732B\u8BF4\u5B83\u53EB\u94F6\u9B03\u732B\u3002" },
          { date: "2026\u5E745\u67085\u65E5 04:28", text: "\u68A6\u89C1\u9A91\u5728\u4E00\u5934\u84DD\u8272\u53D1\u5149\u7684\u9F99\u80CC\u4E0A\u3002\u98CE\u91CC\u6709\u786B\u78FA\u548C\u82B1\u9999\u3002\u592A\u771F\u4E86\uFF0C\u9192\u6765\u624B\u5FC3\u8FD8\u6709\u9CDE\u7247\u7684\u6E29\u5EA6\u3002" },
          { date: "2025\u5E7412\u67081\u65E5", text: "\u8F6C\u53D1 // @\u5C0F\u8BF4\u7D20\u6750\uFF1A\u5982\u4F55\u5851\u9020\u4E00\u5934\u8BA9\u4EBA\u4FE1\u670D\u7684\u9F99\u3002" },
          { date: "2025\u5E7410\u670812\u65E5", text: "\u68A6\u89C1\u4ECE\u90A3\u8FB9\u5E26\u56DE\u6765\u4E00\u679A\u91D1\u5E01\u3002\u51B0\u51C9\u7684\uFF0C\u5FAE\u5FAE\u53D1\u5149\u3002" },
          { date: "2025\u5E749\u67085\u65E5", text: "\u68A6\u89C1\u9A91\u5728\u9F99\u80CC\u4E0A\u98DE\u8FC7\u4E86\u7D2B\u8272\u7684\u8352\u539F\u3002\u5F80\u4E0B\u770B\u7684\u65F6\u5019\u817F\u8F6F\u4E86\u3002" },
          { date: "2025\u5E748\u670820\u65E5", text: "\u53C8\u68A6\u89C1\u4E86\u3002\u90A3\u6761\u9F99\u597D\u50CF\u8BA4\u8BC6\u6211\u4E86\u3002\u51B3\u5B9A\u53EB\u5B83\u827E\u6D1B\u8482\u3002" },
          { date: "2025\u5E748\u670814\u65E5", text: "\u6628\u665A\u505A\u4E86\u4E00\u4E2A\u597D\u771F\u5B9E\u7684\u68A6\u3002\u4E00\u6761\u84DD\u8272\u7684\u9F99\uFF0C\u4F1A\u53D1\u5149\u3002\u5B83\u770B\u7740\u6211\uFF0C\u6211\u4E5F\u770B\u7740\u5B83\u3002" }
        ]
      }
    },

    // ---- 页面 23：相册 ----
    "23": {
      id: "23",
      title: "\u76F8\u518C",
      type: "gallery",
      data: {
        photos: [
          { id: 1, src: "assets/photos/photo1.webp", desc: "\u6B22\u4E50\u8C37\u5408\u5F71", date: "2025\u5E745\u67081\u65E5 14:23:07", location: "\u661F\u613F\u6B22\u4E50\u8C37", selectable: true },
          { id: 2, src: "assets/photos/photo2.webp", desc: "\u9A91\u9F99\u81EA\u62CD", date: "2025\u5E748\u670813\u65E5 17:41:52", location: "\u672A\u77E5\u5730\u70B9", unknown: true },
          { id: 3, src: "assets/photos/photo3.webp", desc: "\u591A\u8089\u690D\u7269", date: "2026\u5E746\u670815\u65E5 11:08:34", location: "\u9633\u5149\u533A" },
          { id: 4, src: "assets/photos/photo4.webp", desc: "\u8292\u679C\u5E72\u5F00\u888B", date: "2026\u5E747\u670823\u65E5 22:15:08", location: "\u9633\u5149\u533A" },
          { id: 5, src: "assets/photos/photo5.webp", desc: "\u5FEB\u9012\u5806", date: "2026\u5E748\u670811\u65E5 16:42:19", location: "\u9633\u5149\u533A" },
          { id: 6, src: "assets/photos/photo6.webp", desc: "\u4E66\u684C", date: "2026\u5E747\u670828\u65E5 02:33:41", location: "\u9633\u5149\u533A" }
        ]
      }
    },

    // ---- 页面 22：视频评论区 ----
    "27": {
      id: "27",
      title: "一个人荒野求生30天挑战",
      type: "article",
      data: {
        title: "一个人荒野求生30天挑战",
        subtitle: "UP主：户外老猫 · 32万播放",
        coverImg: "assets/wilderness-30days.webp",
        content: "",
        comments: [
          { user: "户外老猫（UP主）", text: "置顶：装备清单在置顶评论，大家自取。", pinned: true },
          { user: "山野闲人", text: "老猫这期真的猛，我三天就不行了。👍892" },
          { user: "户外老猫（UP主）", text: "真正的大神都在荒野之心论坛，那边有狠人分享过更离谱的经历。我就是跟着学的。👍567", bold: ["荒野之心"] },
          { user: "芒狗躺平中", text: "我去康康！！谢谢推荐！！🌙✨ 👍23" },
          { user: "户外老猫（UP主）", text: "回复芒狗躺平中：去吧去吧，装备版块干货挺多的。" }
        ]
      }
    },

    // ---- 页面 23：小红书吐槽帖 ----
    "28": {
      id: "28",
      title: "小红书",
      type: "xiaohongshu",
      data: {
        author: "密码记不住星人",
        content: "真的服了，现在这些平台的密码规则是防用户还是防贼啊\n\n谁懂啊，注册个账号要大小写+数字+特殊符号，还不能跟历史密码重复，三个月必须改一次。我每次改完转头就忘，找回密码找回得想砸手机。有没有什么简单好记又符合规则的方法？救救记性差的人。",
        time: "1天前",
        likes: "\u2764\ufe0f 2.3万  \ud83d\udcac 230  \u2b50 892",
        comments: [
          { user: "银鬃猫的最爱", text: "我固定套路：最喜欢东西的首字母缩写 + @ + 平台缩写 + 123。比如我最喜欢月光果（ygg），在这个平台的密码就是 ygg@xhs123。反正也没人猜得到我最喜欢啥，大小写数字符号全齐了，还好记。\ud83d\udc31", time: "1天前 \u00b7 \ud83d\udc4d 892" },
          { user: "路人A", text: "真的" },
          { user: "路人B", text: "真的" },
          { user: "路人C", text: "试了，真的" },
          { user: "银鬃猫的最爱", text: "回复路人C：……你们是真的闲。", isReply: true },
          { user: "峡谷一枝花", text: "学到了。" },
          { user: "今天吃啥", text: "所以月光果是什么东西。" },
          { user: "银鬃猫的最爱", text: "回复今天吃啥：一种很好吃但很难买到的东西。", isReply: true }
        ]
      }
    },

    // ---- 页面 24：浏览器搜索"荒野求生" ----
    "29": {
      id: "29",
      title: "搜索结果",
      type: "browser-search",
      data: {
        query: "荒野求生",
        url: "www.baidu.com",
        results: [
          { title: "荒野之心论坛 - 户外爱好者聚集地", summary: "网址：www.wildernessheart.com\n版块：装备讨论、经验分享、新人报到、闲谈杂谈", source: "www.wildernessheart.com", target: "30", clickable: true },
          { title: "荒野求生·百度百科", summary: "荒野求生（户外探险活动）是指……", source: "baike.baidu.com", clickable: false },
          { title: "荒野求生装备清单推荐 - 知乎", summary: "本人玩户外五年，总结了一份最全装备清单……", source: "www.zhihu.com", clickable: false },
          { title: "贝爷荒野求生全集 - 视频合集", summary: "包含《荒野求生》1-7季全资源……", source: "www.bilibili.com", clickable: false },
          { title: "荒野求生培训班 - 大众点评", summary: "专业教练带队，体验真实野外生存……", source: "www.dianping.com", clickable: false }
        ],
        relatedSearches: ["荒野求生技巧", "野外生存装备", "户外论坛推荐"]
      }
    },

    // ---- 页面 25：荒野之心论坛 ----
    "30": {
      id: "30",
      title: "荒野之心论坛",
      type: "forum",
      data: {
        loginTarget: "33",
        pinnedPosts: [
          { title: "论坛版规 & 发帖指南" },
          { title: "户外活动免责声明" }
        ],
        boards: [
          {
            name: "闲谈杂论",
            count: 5,
            posts: [
              { title: "峡谷一枝花", meta: "最后回复于 08-13 18:32", clickable: false },
              { title: "荒野老狼", meta: "最后回复于 08-13 15:20", clickable: false },
              { title: "《青苔巷规则怪谈》", meta: "银鬃猫的最爱 · 最后修改 08-13 02:17", clickable: true, clickAction: "locked", clickMessage: "该帖已被设置成「仅自己可见」", clickNickname: "银鬃猫的最爱", clickNicknameTarget: "32", prefillAccount: "银鬃猫的最爱" }
            ]
          },
          {
            name: "装备讨论",
            count: 23,
            posts: [
              { title: "【装备咨询】计划去荒野环境长驻采风（含荒野求生向）", meta: "芒狗冒险家 · 最后回复 今天 09:20", clickable: true, target: "31", clickNickname: "芒狗冒险家", clickNicknameTarget: "33", prefillAccount: "芒狗冒险家" },
              { title: "山野闲人", meta: "最后回复于 08-13 14:15", clickable: false },
              { title: "雨林路客", meta: "最后回复于 08-13 11:08", clickable: false }
            ]
          },
          {
            name: "经验分享",
            count: 17,
            posts: [
              { title: "户外老猫", meta: "最后回复于 08-13 09:40", clickable: false },
              { title: "丛林猫", meta: "最后回复于 08-13 20:05", clickable: false },
              { title: "峡谷一枝花", meta: "最后回复于 08-13 16:42", clickable: false }
            ]
          },
          {
            name: "新人报到",
            count: 9,
            posts: [
              { title: "今天吃啥", meta: "最后回复于 08-13 13:30", clickable: false },
              { title: "雨林路客", meta: "最后回复于 08-13 10:22", clickable: false },
              { title: "路过看看", meta: "最后回复于 08-13 08:15", clickable: false }
            ]
          }
        ]
      }
    },

    // ---- 页面 26：林晓论坛帖 ----
    "31": {
      id: "31",
      title: "【装备咨询】计划去荒野环境长驻采风",
      type: "article",
      data: {
        title: "【装备咨询】计划去荒野环境长驻采风（含荒野求生向）",
        author: "芒狗冒险家",
        date: "2026-08-10 21:15",
        authorTarget: "32", authorPrefillAccount: "芒狗冒险家",
        content: "各位大佬好，我计划去一个类似荒野的环境待一段时间（是去采风写小说，不是真的荒野求生）。气候、植被参考热带雨林。目前准备的装备如下：\n\n· 多功能工兵铲\n· 防水打火石×3\n· 便携净水器\n· 压缩饼干×10包\n· 急救包（含常用药品）\n· 防潮睡袋\n· 大容量露营箱（装以上所有）\n\n求大佬们帮看清单是否合理，有没有缺什么或者带错了什么。另外有几个问题：\n\n1. 那边可能有大型猛禽（翼展比较大），需要带防身工具吗？什么比较有效？\n2. 长期在潮湿环境，有什么特别容易被忽略但实际很重要的东西？\n3. 有没有什么你一开始觉得没用、后来发现是神器的装备？\n\n纯采风，不是真冒险，但想尽量准备充分点。谢过大佬们！",
        comments: [
          { user: "荒野老狼", text: "露营箱不行。雨林里没有平路给你拖箱子，换65L以上防水背包，东西分装防水袋。你清单里缺硫磺粉（驱蛇虫）、高热量食物（能量棒或巧克力）、净水药片（备用）、头灯和备用电池、速干衣裤多备两套。大型猛禽带高音哨子或强光手电，别想着打，吓走就行。记录本带防水的。另外你说的那个地方要是真有翼展几米的猛禽，建议换地方采风。采风而已，保命要紧。", time: "08-10 22:40" },
          { user: "芒狗冒险家", text: "感谢大佬！背包和硫磺粉、能量棒这些已下单。速干衣裤之前没想到，也加上了。头灯我有，忘写了。", time: "08-10 23:05", isReply: true },
          { user: "丛林猫", text: "楼上说得对。", time: "08-10 23:30" },
          { user: "雨林路客", text: "蹲一个后续。", time: "08-11 10:15" },
          { user: "芒狗冒险家", text: "装备基本齐了，明天出发。谢谢各位大佬的建议。", time: "08-11 22:30" },
          { user: "荒野老狼", text: "注意安全。回来发个帖报平安。", time: "08-11 23:15", isReply: true },
          { user: "芒狗冒险家", text: "好。一定。", time: "08-11 23:40", isReply: true },
          { user: "峡谷一枝花", text: "楼主回来了吗？蹲后续。", time: "今天 09:20" },
          { user: "路过看看", text: "虽然看不懂但感觉很厉害。", time: "08-12 14:00" },
          { user: "今天吃啥", text: "楼主写完了发出来看看。", time: "08-12 16:30" }
        ]
      }
    },

    // ---- 页面 27：论坛登录选择 ----
    "32": {
      id: "32",
      title: "登录 · 银鬃猫的最爱",
      type: "forum-login",
      data: {
        title: "登录荒野之心论坛",
        storageKey: "forum_saved_accounts",
        accounts: {
          "芒狗冒险家": { passwordKey: "forum_linxiao", successTarget: "37" },
          "银鬃猫的最爱": { passwordKey: "forum_yinmaomao", successTarget: "34" }
        },
        defaultPlaceholder: "",
        securityHint: "密码格式：缩写+@+缩写+数字。你喜欢的那个果子+@+这个论坛的名字缩写+123"
      }
    },

    // ---- 页面 33：锁定账号登录页（预填账号） ----
    "33": {
      id: "33",
      title: "登录 · 芒狗冒险家",
      type: "forum-login",
      data: {
        title: "登录荒野之心论坛",
        storageKey: "forum_saved_accounts",
        defaultAccount: "\u8292\u72D7\u5192\u9669\u5BB6",
        accounts: {
          "芒狗冒险家": { passwordKey: "forum_linxiao", successTarget: "37" },
          "银鬃猫的最爱": { passwordKey: "forum_yinmaomao", successTarget: "34" }
        },
        defaultPlaceholder: "",
        securityHint: "密码格式：缩写+@+缩写+数字。你喜欢的那个果子+@+这个论坛的名字缩写+123"
      }
    },

    // ---- 页面 34：银鬃猫主页 ----
    "34": {
      id: "34",
      title: "银鬃猫的最爱",
      type: "profile",
      data: {
        nickname: "银鬃猫的最爱",
        registerDate: "2025-03-15",
        postCount: 2,
        posts: [
          { title: "\u300A\u9752\u82D4\u5DF7\u89C4\u5219\u602A\u8C08\u300B", date: "2026-07-15", subtitle: "\u6700\u540E\u4FEE\u6539 08-13 02:17", target: "35", clickable: true },
          { title: "\u300A\u5173\u4E8E\u95E8\u7684\u51E0\u4E2A\u53D1\u73B0\u300B", date: "2026-08-01", target: "36", clickable: true }
        ]
      }
    },

    // ---- 页面 31：青苔巷规则怪谈 ----
    "35": {
      id: "35",
      title: "青苔巷规则怪谈",
      type: "article",
      data: {
        title: "《青苔巷规则怪谈》",
        author: "银鬃猫的最爱",
        date: "2026-07-15 · 最后修改 08-13 02:17",
        content: "去之前带一样信物，贴身别摘，摘了就回不来。\n\n第一次捡到的小东西是钥匙，丢了门就没了。\n\n那边的果实叫月光果，吃了能短暂飞行。\n\n那边的龙说一种古语，开门用古语，发音像\u201c路米\u201d什么\u201c纳尔\u201d，念的时候得想着光。",
        boldKeywords: ["信物", "钥匙", "路米", "纳尔"],
        boldContent: true,
        comments: [
          { user: "峡谷一枝花", text: "姐你写小说呢？这么详细。", time: "2026-07-16" },
          { user: "银鬃猫的最爱", text: "你说是就是吧。", isReply: true },
          { user: "雨林路客", text: "月光果那段我记下了。好吃吗。", time: "2026-07-17" },
          { user: "今天吃啥", text: "重点歪了吧。", isReply: true },
          { user: "荒野老狼", text: "别光顾着看热闹。巷子深，晚上别一个人走。老城区那边本来就阴。", time: "2026-07-18" },
          { user: "银鬃猫的最爱", text: "懂行。", isReply: true }
        ]
      }
    },

    // ---- 页面 32：关于门的几个发现 ----
    "36": {
      id: "36",
      title: "关于门的几个发现",
      type: "article",
      data: {
        title: "\u300A\u5173\u4E8E\u95E8\u7684\u51E0\u4E2A\u53D1\u73B0\u300B",
        author: "\u94F6\u9B03\u732B\u7684\u6700\u7231",
        date: "2026-08-01",
        content: "\u7B2C\u4E00\u6B21\u8FDB\u53BB\u7684\u4EBA\u4F1A\u53D8\u5F3A\uFF08\u8F89\u5149\u52A0\u62A4\uFF09\uFF0C\u6301\u7EED\u7EA6\u4E00\u5929\uFF0C\u53EA\u6709\u7B2C\u4E00\u6B21\u3002\n\n\u8FDB\u53BB\u524D\u628A\u4FE1\u7269\u63E1\u5728\u638C\u5FC3\u9ED8\u5FF5\u4E09\u904D\u9F99\u8BED\uFF0C\u5F3A\u5316\u6548\u679C\u66F4\u7A33\u3002\n\n\u53D8\u5F3A\u65F6\u4FE1\u7269\u53D1\u70ED\uFF0C\u76AE\u80A4\u6709\u84DD\u8272\u5149\u7EB9\u3002\n\n\u4FE1\u7269\u5FC5\u987B\u662F\u7B2C\u4E00\u4EF6\u5E26\u56DE\u7684\u4E1C\u897F\uFF0C\u5426\u5219\u95E8\u5F00\u4E00\u534A\u5C31\u5173\u3002",
        boldContent: true,
        comments: [
          { user: "\u5CE1\u8C37\u4E00\u679D\u82B1", text: "\u59D0\u53C8\u53D1\u65B0\u5E16\u4E86\uFF1F\u8E72\u540E\u7EED\u3002", time: "2026-08-02" },
          { user: "\u94F6\u9B03\u732B\u7684\u6700\u7231", text: "\u55EF\u3002", time: "2026-08-02", isReply: true },
          { user: "\u96E8\u6797\u8DEF\u5BA2", text: "\u8F89\u5149\u52A0\u62A4\u662F\u5565\u610F\u601D\uFF0C\u80FD\u98DE\u5417\u3002", time: "2026-08-03" },
          { user: "\u94F6\u9B03\u732B\u7684\u6700\u7231", text: "\u4E0D\u80FD\u98DE\u3002\u4F46\u80FD\u8BA9\u4F60\u8DD1\u5F97\u6BD4\u5E73\u65F6\u5FEB\uFF0C\u529B\u6C14\u5927\u4E00\u70B9\u3002", time: "2026-08-03", isReply: true },
          { user: "\u4ECA\u5929\u5403\u5565", text: "\u697C\u4E0A\u95EE\u80FD\u4E0D\u80FD\u98DE\u7684\u7B11\u6B7B\u6211\u4E86\uFF0C\u91CD\u70B9\u4E0D\u5E94\u8BE5\u662F\u201C\u95E8\u5F00\u4E00\u534A\u5C31\u5173\u201D\u5417\uFF1F\u5361\u4F4F\u600E\u4E48\u529E\u3002", time: "2026-08-03" },
          { user: "\u96E8\u6797\u8DEF\u5BA2", text: "\u90A3\u5C31\u5C34\u5C2C\u4E86\u3002\u534A\u4E2A\u4EBA\u5728\u90A3\u8FB9\u534A\u4E2A\u4EBA\u5728\u8FD9\u8FB9\u3002", time: "2026-08-03", isReply: true },
          { user: "\u5CE1\u8C37\u4E00\u679D\u82B1", text: "\u4F60\u4EEC\u804A\u5F97\u6211\u5BB3\u6015\u3002\u8FD9\u5E16\u5B50\u4E0D\u662F\u5199\u5C0F\u8BF4\u7684\u5417\u600E\u4E48\u90FD\u5F00\u59CB\u8BA8\u8BBA\u5B9E\u64CD\u4E86\u3002", time: "2026-08-04", isReply: true },
          { user: "\u8352\u91CE\u8001\u72FC", text: "\u4FE1\u7269\u90A3\u4E00\u6761\uFF0C\u548C\u4E4B\u524D\u8BF4\u201C\u7B2C\u4E00\u4EF6\u5E26\u56DE\u7684\u4E1C\u897F\u662F\u94A5\u5319\u201D\u662F\u4E00\u56DE\u4E8B\u5417\uFF1F", time: "2026-08-05" },
          { user: "\u94F6\u9B03\u732B\u7684\u6700\u7231", text: "\u4E0D\u662F\u4E00\u56DE\u4E8B\u3002\u4F46\u4F5C\u7528\u5DEE\u4E0D\u591A\uFF0C\u90FD\u662F\u8FC7\u95E8\u7528\u7684\u3002\u6709\u4E00\u6837\u5C31\u591F\u4E86\uFF0C\u4E0D\u7528\u4E24\u4E2A\u90FD\u5E26\u3002", time: "2026-08-05", isReply: true, bold: true },
          { user: "\u8352\u91CE\u8001\u72FC", text: "\u90A3\u8981\u662F\u4E00\u4E2A\u90FD\u6CA1\u6709\u4E86\u5462\u3002", time: "2026-08-05", isReply: true },
          { user: "\u94F6\u9B03\u732B\u7684\u6700\u7231", text: "\u90A3\u5C31\u770B\u547D\u3002", time: "2026-08-05", isReply: true, bold: true }
        ]
      }
    },

    // ---- 页面 33：欢乐谷新闻 ----
    "38": {
      id: "38",
      title: "新闻",
      type: "article",
      data: {
        title: "新闻",
        content: "星愿欢乐谷已于2026年3月停业，原址改建为拾光里创意文化园\n来源：阳光区新闻·2026-03-20\n\n本报讯，运营二十余年的星愿欢乐谷主题公园已于2026年3月正式停业。原址将改建为\"拾光里创意文化园\"，预计年底对外开放。园区保留了部分原有景观设施，周边交通便利。",
        bold: ["\"拾光里创意文化园\""]
      }
    },

    // ---- 页面 34：地图-拾光里 ----
    "39": {
      id: "39",
      title: "拾光里",
      type: "map",
      data: {
        title: "拾光里",
        name: "拾光里创意文化园",
        address: "阳光区·拾光里18号",
        status: "营业中（原星愿欢乐谷改建）",
        transport: "途经公交：45路、67路、112路"
      }
    },

    // ---- 页面 35：易存柜地址选择 ----
    "40": {
      id: "40",
      title: "易存柜",
      type: "choice-list",
      data: {
        title: "易存柜",
        searchPlaceholder: "输入柜机地址关键词",
        allOptions: [
          { text: "拾光里3号柜机", correct: false },
          { text: "拾光里6号柜机", correct: false },
          { text: "拾光里9号柜机", correct: false },
          { text: "拾光里14号柜机", correct: false },
          { text: "拾光里18号柜机", correct: true },
          { text: "拾光里22号柜机", correct: false }
        ],
        correctTarget: "41",
        confirmText: "确认取件",
        errorMessage: "取件码无效。请确认柜机地址。",
        noMatchMessage: "未找到匹配的柜机地址"
      }
    },

    // ---- 页面 36：易存柜取件码 ----
    "41": {
      id: "41",
      title: "取件",
      type: "input-code",
      data: {
        address: "拾光里18号",
        prompt: "请输入6位取件码",
        codeLength: 6,
        correctCode: "436464",
        setHasCoin: true,
        successTitle: "🎉 柜门已打开",
        successContent: "你取出一个小布袋。打开布袋，一枚金币滑出来。触感冰凉，边缘有不规则的咬痕——真金，咬过，软的。它在你掌心微微发光。\n布袋底部有一张纸条：\"你一枚，我一枚，咱俩暴富姐妹花。生日快乐！\"——林晓",
        successBtnText: "收下",
        errorMessage: "取件码错误。请确认。"
      }
    },

    // ---- 页面 42：森屿烘焙商家页 ----
    "42": {
      id: "42",
      title: "森屿烘焙",
      type: "shop",
      data: {
        title: "森屿烘焙",
        subtitle: "森屿烘焙（春申路店）",
        category: "🍰 面包甜点 · 人均 ¥58",
        hours: "09:00-21:00",
        address: "阳光区春申路112号",
        phone: "173xxxx1234",
        recommend: "栗子蛋糕、椰蓉蛋糕、芒果慕斯、提拉米苏、巴斯克芝士",
        buttonText: "查看完整菜单",
        menuImage: "assets/menu.webp"
      }
    },

    // ---- 页面 38：烘焙店菜单 ----
    "43": {
      id: "43",
      title: "菜单",
      type: "menu",
      data: {
        title: "菜单",
        menuImage: "assets/menu.webp",
        categories: [
          {
            name: "🎂整只生日蛋糕",
            items: [
              { en: "Brume", zh: "法式栗子蓉香草奶霜蛋糕" },
              { en: "Solace", zh: "南洋椰蓉白巧海盐奶盖蛋糕" }
            ]
          },
          {
            name: "🍰切块蛋糕",
            items: [
              { en: "Ember", zh: "流心巴斯克焦香芝士" },
              { en: "Reverie", zh: "意式提拉米苏咖啡酒浸手指饼" },
              { en: "Noir", zh: "法芙娜黑森林酒渍樱桃" },
              { en: "Velvet", zh: "红丝绒乳酪霜配可可脆珠" },
              { en: "Hush", zh: "宇治抹茶日本柚子凝乳" },
              { en: "Ebb", zh: "海盐焦糖脆脆坚果奶油" }
            ]
          },
          {
            name: "🍮慕斯与布丁",
            items: [
              { en: "Gleam", zh: "芒果百香果轻慕斯" },
              { en: "Fable", zh: "草莓罗勒奶霜卷" },
              { en: "Murmur", zh: "蓝莓芝士塔配杏仁酥粒" },
              { en: "Verve", zh: "树莓白巧马斯卡彭慕斯" },
              { en: "Whisper", zh: "黑芝麻豆乳布丁配蜂蜜脆片" }
            ]
          },
          {
            name: "🍪常温甜点",
            items: [
              { en: "Zephyr", zh: "柠檬玛德琳配柠檬糖霜" },
              { en: "Lumen", zh: "香草朗姆可露丽" },
              { en: "Aura", zh: "焦化黄油费南雪" }
            ]
          }
        ],
        diaryPassword: "Brume"
      }
    },

    // ---- 页面 39：青苔巷结局 ----
    "44": {
      id: "44",
      title: "新闻",
      type: "article",
      data: {
        title: "女性在青苔巷离奇失踪，监控拍到诡异蓝光",
        author: "都市晚报",
        date: "2026-06-22",
        coverImg: "assets/alley-news.webp",
        content: "24岁女性王某于2026年6月20日在青苔巷失踪，监控最后画面显示她走入巷子深处后，一道蓝色光晕闪过，人便消失。\n\n警方已介入调查，目前尚未发现明显线索。青苔巷位于老城区深处，因常年潮湿、墙面遍布青苔而得名。该巷道年久失修，部分路段照明设施损坏，夜间通行条件较差。",
        comments: []
      }
    },

    // ---- 页面 45：青苔巷导航 ----
    "45": {
      id: "45",
      title: "青苔巷",
      type: "finale",
      data: {
        phase: "search",
        results: [],
        mapCard: {
          title: "青苔巷",
          desc: "阳光区老城区青苔巷",
          btnText: "开始导航",
          noCoinMsg: "你还没有钥匙。规则帖说，钥匙是第一次捡到的小东西。"
        },
        prepareTitle: "出发之前",
        preparationContent: "你砸开了母亲的老木柜。\n\n那把截短的猎枪还靠在角落里，枪托上刻着那行祈福语录。两发霰弹已经上膛，抽屉里还有十发。\n\n你把金币握在掌心。出门前回头看了一眼林晓的房间，然后关上门。\n\n青苔巷在等你。",
        sceneTitle: "青苔巷",
        sceneText: "巷子比想象中深。两侧墙壁爬满青苔，空气里是潮湿的泥土味。\n\n走到尽头，一团蓝色辉光浮动。金币在掌心发烫。\n\n你默念了一遍母亲的祈福语录。念了就敢往前走。\n\n这时候该念什么呢。",
        inputPlaceholder: "输入龙语（英文）",
        correctAnswer: "luminar",
        errorMessage: "辉光没有变化。再想想那个词。",
        endingText: "你说出了那个词。\n\nLuminar。\n\n辉光吞没了你。\n\n金币烫得像一块刚从火里取出的炭。手臂流过蓝色光纹，皮肤下隐隐发光。\n\n空气骤然变化——潮湿的苔藓味被一种奇异的花香取代。你睁开眼。\n\n天空有两颗月亮。\n\n远处传来熟悉的声音。\n\n你把猎枪端在手里，默念祈福语录。枪膛里透出一缕蓝光。\n\n你向声音传来的方向跑去。\n\n—— 流星雨的约定 · 完 ——"
      }
    },

    // ---- 页面 46：加密日记 ----
    "46": {
      id: "46",
      title: "\u52A0\u5BC6\u65E5\u8BB0",
      type: "diary",
      data: {
        locked: true,
        password: "Brume",
        passwordHint: "\u751F\u65E5\u86CB\u7CD5\u7684\u540D\u5B57\uFF08\u82F1\u6587\uFF09",
        entries: [
          { date: "2026-08-13", content: "\u6700\u540E\u4E00\u6B21\u5199\u65E5\u8BB0\u3002\u660E\u5929\u5C31\u8981\u51FA\u53D1\u4E86\u3002\u88C5\u5907\u90FD\u5728\u80CC\u5305\u91CC\uFF0C\u9879\u94FE\u3001\u91D1\u5E01\u3001\u624B\u7535\u7B52\u3002\u5982\u679C\u6211\u6CA1\u56DE\u6765\uFF0C\u8FD9\u672C\u65E5\u8BB0\u5C31\u662F\u7EBF\u7D22\u3002" },
          { date: "2026-08-12", content: "\u7EC3\u4E86\u4E00\u4E0B\u5F13\u3002\u624B\u751F\u4E86\uFF0C\u4F46\u5C04\u4E0D\u51C6\u3002\u53F6\u79BE\u8BF4\u6211\u8FD9\u662F\u201C\u5C04\u661F\u661F\u201D\u4E0D\u662F\u5C04\u7BAD\u3002\u5979\u8BF4\u5F97\u5BF9\u3002" },
          { date: "2026-08-10", content: "\u5728\u8BBA\u575B\u53D1\u4E86\u4E2A\u5E16\u5B50\u95EE\u88C5\u5907\u3002\u6709\u4EBA\u56DE\u590D\u5F88\u8BA4\u771F\uFF0C\u53EB\u8352\u91CE\u8001\u72FC\u3002\u4ED6\u7684\u5EFA\u8BAE\u5F88\u4E13\u4E1A\uFF0C\u4F46\u6211\u4E0D\u80FD\u8BF4\u6211\u4E3A\u4EC0\u4E48\u8981\u53BB\u3002" },
          { date: "2026-08-08", content: "\u53C8\u68A6\u5230\u4E86\u90A3\u8FB9\u3002\u8FD9\u6B21\u68A6\u5230\u7684\u662F\u4E00\u7247\u96E8\u6797\uFF0C\u7A7A\u6C14\u91CC\u6709\u786B\u78FA\u548C\u82B1\u9999\u3002\u827E\u6D1B\u8482\u5728\u7B49\u6211\u3002\u5B83\u7684\u9CDE\u7247\u53C8\u6697\u4E86\u4E00\u4E9B\u3002" },
          { date: "2026-08-05", content: "\u53F6\u79BE\u7ED9\u6211\u4E70\u4E86\u8292\u679C\u5E72\u3002\u5979\u8BF4\u201C\u8FD9\u662F\u6211\u4EEC\u7684\u7EA6\u5B9A\u201D\u3002\u6211\u95EE\u4EC0\u4E48\u7EA6\u5B9A\uFF0C\u5979\u8BF4\u201C\u4F60\u5FD8\u4E86\u201D\u3002\u6211\u771F\u7684\u5FD8\u4E86\u3002" },
          { date: "2026-08-01", content: "\u8BBA\u575B\u4E0A\u6709\u4E2A\u4EBA\u53EB\u94F6\u9B03\u732B\u7684\u6700\u7231\uFF0C\u53D1\u4E86\u5F88\u591A\u5173\u4E8E\u201C\u95E8\u201D\u7684\u5E16\u5B50\u3002\u770B\u8D77\u6765\u50CF\u662F\u7F16\u7684\uFF0C\u4F46\u6211\u77E5\u9053\u90A3\u4E0D\u662F\u7F16\u7684\u3002\u90A3\u4E9B\u89C4\u5219\u662F\u771F\u7684\u3002" },
          { date: "2026-07-28", content: "\u5C0F\u53F7\u91CC\u5199\u4E86\u5F88\u591A\u201C\u68A6\u201D\u3002\u6709\u4EBA\u8BF4\u6211\u5199\u5F97\u50CF\u5C0F\u8BF4\u3002\u4E0D\u662F\u5C0F\u8BF4\u3002\u90A3\u4E9B\u90FD\u662F\u771F\u7684\u3002\u53EA\u662F\u6CA1\u4EBA\u4FE1\u3002" },
          { date: "2026-07-15", content: "\u68A6\u89C1\u94F6\u9B03\u732B\u4E86\u3002\u5B83\u5728\u96C6\u5E02\u5077\u5403\u4E00\u79CD\u53D1\u5149\u7684\u679C\u5B50\u3002\u6211\u5E2E\u5B83\u85CF\u4E86\u8D77\u6765\uFF0C\u5B83\u7528\u8111\u888B\u8E6D\u6211\u7684\u624B\u3002\u90A3\u79CD\u679C\u5B50\u53EB\u6708\u5149\u679C\uFF0C\u5F53\u5730\u4EBA\u53EB\u5B83yggdrasil\u3002" }
        ]
      }
    },

    // ---- 页面 40：林晓论坛个人主页 ----
    "37": {
      id: "37",
      title: "\u8292\u72D7\u5192\u9669\u5BB6",
      type: "profile",
      data: {
        nickname: "\u8292\u72D7\u5192\u9669\u5BB6",
        registerDate: "2025-08-13",
        postCount: 1,
        posts: [
          { title: "\u300A\u3010\u88C5\u5907\u54A8\u8BE2\u3011\u8BA1\u5212\u53BB\u8352\u91CE\u73AF\u5883\u957F\u9A7B\u91C7\u98CE\uFF08\u542B\u8352\u91CE\u6C42\u751F\u5411\uFF09\u300B", date: "2026-08-10", subtitle: "\u6700\u540E\u56DE\u590D \u4ECA\u5929 09:20", target: "31", clickable: true }
        ],
        favorites: [
          { title: "\u300A\u96E8\u6797\u51C0\u6C34\u5B9E\u6D4B\u300B", author: "\u6237\u5916\u8001\u732B", date: "2026-08-11", clickable: false },
          { title: "\u300A\u7B2C\u4E00\u6B21solo\u9732\u8425\u7FFB\u8F66\u8BB0\u5F55\u300B", author: "\u4E1B\u6797\u732B", date: "2026-08-09", clickable: false },
          { title: "\u300A\u5DE5\u5177\u94F2\u9009\u8D2D\u6307\u5357\u300B", author: "\u96E8\u6797\u8DEF\u5BA2", date: "2026-08-06", clickable: false },
          { title: "\u300A\u91CE\u5916\u51C0\u6C34\u5668\u63A8\u8350\u300B", author: "\u5C71\u91CE\u95F2\u4EBA", date: "2026-08-02", clickable: false }
        ],
        drafts: [
          { title: "\u300A\u5173\u4E8E\u90A3\u4E2A\u4E16\u754C\u7684\u8BB0\u5F55\u300B\uFF08\u672A\u53D1\u5E03\uFF09", date: "2026-08-11", content: "\u5173\u4E8E\u90A3\u4E2A\u4E16\u754C\u7684\u8BB0\u5F55\n\n\u4E24\u9897\u6708\u4EAE\u3002\u84DD\u8272\u9F99\u3002\u53D1\u5149\u7684\u91D1\u5E01\u3002\n\n\u90A3\u8FB9\u6709\u4E24\u9897\u6708\u4EAE\uFF0C\u5927\u7684\u53EBCyn\uFF0C\u5C0F\u7684\u53EBThia\u3002\u5408\u8D77\u6765\u5FF5\u662FCynthia\u3002\n\n\u5F53\u5730\u4EBA\u7BA1\u5B83\u4EEC\u53EB\u53CC\u5B50\u3002\n\n\u5199\u51FA\u6765\u4E5F\u6CA1\u4EBA\u4FE1\u3002\u5B58\u7740\u5427\u3002", boldKeywords: ["Cynthia"] }
        ]
      }
    },

    // ---- 页面 44：淘宝主页 ----
    "09": {
      id: "09",
      title: "淘宝",
      type: "taobao-home",
      data: {
        searchPlaceholder: "搜索",
        entries: [
          { text: "我的订单", target: "10", clickable: true },
          { text: "购物车", clickable: false },
          { text: "收藏夹", clickable: false },
          { text: "足迹", clickable: false }
        ],
        recommendations: [
          { title: "露营箱 大容量便携款", price: "¥189", target: "08" },
          { title: "户外折叠椅", price: "¥68" },
          { title: "便携水壶", price: "¥35" },
          { title: "速干毛巾", price: "¥29" },
          { title: "防晒帽", price: "¥45" }
        ]
      }
    },

    // ---- 页面 42：B站首页 ----
    "24": {
      id: "24",
      title: "户外露营装备开箱",
      type: "article",
      data: {
        title: "户外露营装备开箱",
        subtitle: "UP主：露营小白 · 8万播放 · 8月1日",
        coverImg: "assets/camping-box.webp",
        content: "",
        comments: [
          { user: "露营小白（UP主）", text: "置顶：装备链接在简介，大家自取。", pinned: true },
          { user: "山野闲人", text: "箱子不错，适合短途露营。👍45" },
          { user: "芒狗躺平中", text: "买了买了！🏕️ 👍3" }
        ]
      }
    },

    // ---- 页面 25：B站首页 ----
    "25": {
      id: "25",
      title: "bilibili",
      type: "bilibili-home",
      data: {
        entries: [
          { text: "观看历史", target: "26", clickable: true },
          { text: "我的收藏", clickable: false },
          { text: "稍后再看", clickable: false }
        ],
        videos: [
          { title: "户外装备选购指南", author: "户外老猫", views: "12万播放" },
          { title: "野外生存技巧", author: "山野闲人", views: "8万播放" },
          { title: "露营必备清单", author: "丛林猫", views: "5万播放" }
        ],
        navTabs: [
          { text: "首页", active: true, target: null },
          { text: "动态", active: false, target: null },
          { text: "历史", active: false, target: "26" },
          { text: "稍后再看", active: false, target: null }
        ]
      }
    },

    // ---- 页面 26：B站观看历史 ----
    "26": {
      id: "26",
      title: "观看历史",
      type: "bilibili-history",
      data: {
        videos: [
          { title: "两分钟教你如何荒野求生", progress: "已看72%", date: "8月12日", bold: ["荒野求生"] },
          { title: "荒野求生的一百个小妙招", progress: "已看完", date: "8月11日", bold: ["荒野求生"] },
          { title: "野外净水器实测，荒野求生必备", progress: "已看完", date: "8月10日", bold: ["荒野求生"] },
          { title: "荒野求生装备红黑榜", progress: "已看45%", date: "8月9日", bold: ["荒野求生"] },
          { title: "一个人荒野求生30天挑战", progress: "已看完", date: "8月9日", bold: ["荒野求生"], target: "27" },
          { title: "户外露营装备开箱", progress: "已看完", date: "8月8日" },
          { title: "新手露营避坑指南", progress: "已看完", date: "8月7日" }
        ]
      }
    },

  },

  // ========== 密码验证表 ==========
  // 各场景的账号密码及安全问题
  passwords: {
    qq: {
      account: "13805618823",
      password: "20220612",
      securityQuestion: "你最难忘的一天是？",
      securityAnswer: "20220612"
    },
    weibo: {
      account: "13805618823",
      password: "20040415",
      securityQuestion: "我的生日是？（8位数字）",
      securityAnswer: "20040415"
    },
    weibo_private: { password: "cynthia", securityQuestion: "\u53CC\u6708\u540D\u5B57\uFF08\u82F1\u6587\uFF09", caseInsensitive: true },
    forum_linxiao: {
      account: "芒狗冒险家",
      password: "elodie",
      caseInsensitive: true
    },
    forum_yinmaomao: {
      account: "银鬃猫的最爱",
      password: "ygg@hyzx123",
      caseInsensitive: true
    },
    locker_address: {
      answer: "18"
    },
    locker_code: {
      answer: "436464"
    },
    finale: {
      answer: "luminar",
      caseInsensitive: true
    }
  },

  // ========== DeepSeek 提示表 ==========
  // 按页面编号索引，对应 DeepSeek 对页面编号查询的回复
  hints: {
    // 非解谜页面（暗示到达方式）
    "01": "打开备忘录，她会把重要的事写在最前面。",
    "02": "打开短信，里面有两条重要消息。",
    "03": "搜索自己的名字，会发现她记下的一些小事。",
    "04": "打开电话，那十一位数字是她的号码。",
    "05": "桌面小组件或打开日历，八月里标注了一个你不熟悉的日子。",
    "06": "打开微信，三个人和她聊过。",
    "07": "点进聊天列表，有人和她分享过好多。",
    "08": "微信聊天记录里，她给朋友发过一个淘宝链接，点开就是。",
    "09": "淘宝首页，从商品页面点左上角就能进来。",
    "10": "看看在淘宝买了什么。",
    "12": "在主屏幕上方搜机主的名字，会看到两篇关于她的文章。",
    "13": "打开百科，写着每一本书的出版日。",
    "14": "点开那篇采访，她在里面笑得很开心。",
    "19": "登录微博后，她的首页没什么特别的，但右边推荐了一个名字很长的账号。",
    "20": "从她首页右边点进去，那个小号上了锁。",
    "21": "B站的观看历史里面有她网络冲浪的痕迹，她是否在其他地方隐藏着什么。",
    "23": "打开相册，那个彩色图标里有两张照片很特别。",
    "24": "小鹿分享的视频，没什么特别的线索。",
    "25": "从视频页面点左上角就能到B站首页，但没什么好看的。",
    "26": "B站首页点观看历史就能看到，有一个视频值得再看看。",
    "27": "观看历史里有个视频提供了如何求生的线索。",
    "28": "微信里小鹿分享的另一个链接，有人在那里说过自己设密码的套路。",
    "29": "搜索那条视频评论里提到的地方。",
    "30": "论坛里有个帖子锁着，发帖人的名字像一只猫。",
    "31": "论坛里唯一一条能直接点开的帖子，是她发的装备求助。",
    "34": "还记得小红书上那个设密码的人吗，她在论坛也有账号。",
    "35": "规则都写在里面，像一本说明书。",
    "36": "上一篇的进阶版，里面还藏着一些秘密。",
    "37": "这是林晓在论坛的账号。",
    "38": "看看相册里那张合影上的游乐场名字，它已经停业改建了。",
    "39": "搜新闻里提到的那个新地名，地图会告诉你门牌号。",
    "42": "搜生日蛋糕店的名字，看看蛋糕店都卖什么。",
    "43": "在蛋糕店页面点查看菜单，两款蛋糕的名字都很好听。",
    "44": "是否对规则怪谈的地点有一些好奇？搜那条老巷子的名字看看。",

    // 解谜页面（隐晦提示答案）
    "11": "她和AI聊过一次，问了一个发音像「路米纳尔」的词。",
    "15": "账号是那串十一位数字，密码是某个夏天的日子。",
    "16": "说说都敞开着，只有一条笔记锁着，答案在每月都买的零食里。",
    "17": "转发过一篇流星雨科普，评论区聊过九宫格能当密码生成器。",
    "18": "八位数生日，一半在短信里，另一半在桌面上那个倒计时里。",
    "22": "每一条都像小说素材，蓝龙的名字、发光的果子、一只猫、一个词。",
    "32": "密码套路藏在小红书里，她最喜欢的东西和论坛名字缩写。",
    "33": "林晓在论坛的马甲。密码的答案在她的QQ空间里。",
    "40": "短信里到底存了什么东西，该去取了。地名有六个选项，只有一个是地图上写过的门牌号。",
    "41": "六位数。双子座的英文。九宫格。她朋友在空间里聊过这个。",
    "45": "巷子尽头有光。握紧那枚金币，想一个词。那个词的意思是光。",
    "46": "搜索光就可以找到入口，密码是那款蛋糕的英文名。"
  },

  // ========== 搜索映射表 ==========
  // 搜索关键词到页面 ID 的映射
  // 搜索卡片映射：关键词 → 匹配结果卡片数组
  // 每张卡片: { icon, title, target, action?, condition? }
  // action: 'navigate'（默认）| 'expand-gemini' | 'check-coin'
  searchCards: {
    "林晓": [
      { icon: "📄", title: "浏览器搜索 · 林晓", target: "12" }
    ],
    "叶禾": [
      { icon: "📝", title: "笔记 · 关于叶禾", target: "03" }
    ],
    "星愿欢乐谷": [
      { icon: "📰", title: "新闻 · 星愿欢乐谷停业改建", target: "38" }
    ],
    "拾光里": [
      { icon: "📍", title: "地图 · 拾光里创意文化园", target: "39" }
    ],
    "拾光里创意文化园": [
      { icon: "📍", title: "地图 · 拾光里创意文化园", target: "39" }
    ],
    "荒野求生": [
      { icon: "🌐", title: "浏览器搜索 · 荒野求生", target: "29" }
    ],
    "荒野之心": [
      { icon: "🌐", title: "浏览器搜索 · 荒野求生", target: "29" }
    ],
    "荒野之心论坛": [
      { icon: "🌐", title: "浏览器搜索 · 荒野求生", target: "29" }
    ],
    "易存柜": [
      { icon: "📦", title: "易存柜 · 查找附近柜机", target: "40" }
    ],
    "双子座": [
      { icon: "👥", title: "QQ空间 · 双子座流星雨科普", target: "17", action: "expand-gemini" }
    ],
    "gemini": [
      { icon: "👥", title: "QQ空间 · 双子座流星雨科普", target: "17", action: "expand-gemini" }
    ],
    "青苔巷": [
      { icon: "📰", title: "新闻 · 青苔巷失踪事件", target: "44" },
      { icon: "🗺️", title: "地图 · 青苔巷（导航）", target: "45", action: "check-coin" }
    ],
    "芒狗": [
      { icon: "🛒", title: "淘宝 · 我的订单", target: "10" }
    ],
    "森屿烘焙": [
      { icon: "🍰", title: "大众点评 · 森屿烘焙", target: "42" }
    ],
    "luminar": [
      { icon: "🔐", title: "加密日记", target: "46" }
    ],
    "艾尔诺拉": [
      { icon: "👤", title: "微博 · 艾尔诺拉冒险队队长", target: "20" }
    ]
  },

  // ========== 全局状态 ==========
  // 运行时游戏状态（从localStorage恢复）
  state: (function() {
    try { return JSON.parse(localStorage.getItem('meteor_game_state')) || null; } catch(e) { return null; }
  })() || {
    hasCoin: false,        // 是否已获取金币
    currentPage: null,     // 当前页面 ID
    visitedPages: [],      // 已访问页面 ID 列表
    previousPage: null     // 上一个页面 ID（用于返回）
  },

  // ========== 页面跳转关系 ==========
  // 可点击元素 ID 到目标页面 ID 的映射，用于事件绑定
  navigation: {
    // 页面内的链接跳转
    "07_xiaohongshu_link": "28",
    "07_taobao_link": "08",
    "11_baidu_link": "13",
    "11_interview_link": "14",
    "21_last_video": "27",
    "08_my_taobao": "10",
    "15_at_yehe": "16",
    "18_small_account": "19",
    "24_forum_link": "30",
    "25_linxiao_post": "31",
    "25_yinmaomao": "32",
    "27_linxiao": "28",
    "27_other": "33",
    "29_login_success": "34",
    "30_post1": "35",
    "30_post2": "36",
    "37_menu": "43",
    "35_confirm": "41",
    "39_navigate": "39_preparation",
    "39_preparation_go": "39_scene",

    // 主屏幕 App 图标到页面 ID 的映射
    "app_memo": "01",
    "app_phone": "04",
    "app_sms": "02",
    "app_wechat": "07",
    "app_calendar": "05",
    "app_browser": "12",
    "app_qq": "15",
    "app_weibo": "18",
    "app_taobao": "08",
    "app_video": "21",
    "app_deepseek": "11",
    "app_photos": "20",
    "app_footprints": "footprints"
  }
};

// 暴露到全局
window.gameData = gameData;
