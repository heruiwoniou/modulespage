define(
    [
        'vue',
        //引用控件
        './../components/preview/TabBar',
        './../components/preview/StaticHeader',
        './../components/preview/ChoiceQuestion',
        './../components/preview/PicChoiceQuestion',
        './../components/preview/SectionGroup',
        './../components/preview/UnmixedText',
        './../components/preview/QuestionResponse',
        './../components/preview/GradeQuestion',
        './../components/preview/MatrixChoiceQuestion'
    ],
    function(Vue) {
        var viewModel;//数据模型
        return {
            init: function() {
                this.vue();
            },
            vue: function() {
                var that=this;
                viewModel = new Vue({
                    el: 'body',
                    data: (function() {
                        if (localStorage.data && localStorage.data !== "null" && localStorage.data !== "undefined") {
                            data = JSON.parse(localStorage.data);
                            return data;
                        }else {
                            return JSON.parse('{"dragging":false,"logic":[],"selectindex":"0-6","header":{"type":"StaticHeader","id":"536047f1-c358-ede2-1351-af9e464ac551","title":"听说你们很会玩lol?","comment":"(全国卷)","src":"/Upload/images/preview-background.jpg","default":"/Upload/images/preview-background.jpg","bold":false,"color":"#2a2727"},"tab":{"type":"TabBar","id":"cd441a0a-e5a9-c27c-0133-a2898b4f2158","items":["英雄联盟","LOL"]},"children":[{"type":"SectionGroup","id":"0dc08714-6dc6-2fb2-39bb-a5f8b460ebed","title":"一,选择题","children":[{"type":"ChoiceQuestion","id":"fe451a02-d098-7ba6-46c5-ae5a9c6ae17f","qindex":1,"single":true,"title":"反曲之弓提供的攻击速度加成是","items":["25%","35%","40%","45%"],"bold":false,"color":"#2a2727","must":false,"value":[]},{"type":"GradeQuestion","id":"498de7db-c43c-9abe-f942-f37ec03643bb","qindex":2,"logic":[],"self":false,"xtype":0,"range":{"min":0,"max":100},"bold":false,"color":"#2a2727","must":false,"value":"","title":"给我打个分"},{"type":"GradeQuestion","id":"7e0aa8bb-a8e4-c1d8-0c96-fe3a5dbd67ea","qindex":3,"logic":[],"self":false,"xtype":1,"range":{"min":0,"max":100},"bold":false,"color":"#2a2727","must":false,"value":"","title":"给我打个分"},{"type":"GradeQuestion","id":"78cf6ee0-9992-26a5-19a7-d4466467b2e5","qindex":4,"logic":[],"self":false,"xtype":2,"range":{"min":0,"max":100},"bold":false,"color":"#2a2727","must":false,"value":"","title":"给我打个分"},{"type":"GradeQuestion","id":"7a855951-7362-2f4a-21c4-ea7b64c9b7a3","qindex":5,"logic":[],"self":true,"xtype":3,"range":{"min":0,"max":100},"bold":false,"color":"#2a2727","must":false,"value":"","title":"给我打个分"},{"type":"GradeQuestion","id":"f580b742-5890-6e07-ba12-3c5f42270829","qindex":6,"logic":[],"self":true,"xtype":4,"range":{"min":0,"max":100},"bold":false,"color":"#2a2727","must":false,"value":"","title":"给我打个分"},{"type":"GradeQuestion","id":"b87abb9c-7c5a-873a-7433-69d877c3e1a7","qindex":7,"logic":[],"self":true,"xtype":5,"range":{"min":0,"max":100},"bold":false,"color":"#2a2727","must":false,"value":"","title":"给我打个分"},{"type":"ChoiceQuestion","id":"c9a8e58d-a845-ac3e-c53c-028e882837f7","qindex":8,"single":true,"title":"红水晶提供的生命值加成是","items":["150","180","200","250"],"bold":false,"color":"#2a2727","must":false,"value":[]},{"type":"ChoiceQuestion","id":"593483bd-ef45-ec78-5847-3bd20dce198a","qindex":9,"single":true,"title":"半人马-战争之影，他的暴走技能[Q]在击中至少一名敌人之后，将叠加一层暴怒效果，使该技能CD减少一秒，如果他击中敌人四次，那么该技能将会减少多少秒","items":["1秒","2秒","3秒","4秒"],"bold":false,"color":"#2a2727","must":false,"value":[]},{"type":"ChoiceQuestion","id":"f28fd6ec-967e-4cb1-fe54-f646cbee2773","qindex":10,"single":true,"title":"深海泰坦的排山倒海[被动]：他的普通攻击会对目标造成额外伤害并将目标舒服在原地，即眩晕效果。这个特效在多少秒内只能对相同目标生效一次？","items":["6秒","8秒","10秒","12秒 "],"bold":false,"color":"#2a2727","must":false,"value":[]},{"type":"ChoiceQuestion","id":"ad44e8b2-3711-46f1-51bc-69d05330bc8e","qindex":11,"single":true,"title":"S3新物品“符文壁垒”是由军团圣盾（+250生命值，+20魔法抗性，+20护甲）和一件抗魔斗篷（+20魔法抗性）合成而来，请问符文壁垒自带的魔法抗性为多少？","items":["30","35","40","45"],"bold":false,"color":"#2a2727","must":false,"value":[]},{"type":"ChoiceQuestion","id":"6dba17df-5e71-4b24-8d2e-fe9e9ad9e53f","qindex":12,"single":true,"title":"以下哪个由凯奇的幸运手合成而来的装备提供+5%移动速度加成？","items":["莫雷洛秘典","极冰碎片","双生暗影","黯炎火炬"],"bold":false,"color":"#2a2727","must":false,"value":[]},{"type":"ChoiceQuestion","id":"5a4204df-f582-db8a-f1dd-7da2bb7cd3d9","qindex":13,"single":true,"title":"以下哪个装备属性为“+500生命值，+30护甲，+14生命回复/5秒，+7法力回复/5秒，唯一-被动-屠夫（对野怪造成的伤害提高25%），唯一-被动-韧性（收到的晕眩、减速、嘲讽、恐惧、沉默、致盲和禁锢的持续时间减少35%）”？","items":["精魄之石","破碎幽灵之精魂","蜥蜴长老之精魂","远古魔像之精魂"],"bold":false,"color":"#2a2727","must":false,"value":[]},{"type":"ChoiceQuestion","id":"a38c0bf4-1b82-24f0-fdcc-4e951caaebb6","qindex":14,"single":true,"title":"以下哪个英雄没有“使用后可得到一个吸收伤害的护盾”的技能","items":["拉莫斯","斯卡纳","卡尔玛","戴安娜"],"bold":false,"color":"#2a2727","must":false,"value":[]},{"type":"ChoiceQuestion","id":"eeaab84e-ffab-4c51-9254-b71c9580280b","qindex":15,"single":true,"title":"倍受中路AP英雄喜爱的中亚沙漏属性为以下哪一个选项？","items":["+80法术强度/+50护甲/主动：让你的英雄凝滞2秒，冷却时间90秒","+80法术强度/+50护甲/主动：让你的英雄凝滞2.5秒，冷却时间90秒","+100法术强度/+50护甲/主动：让你的英雄凝滞2秒，冷却时间90秒","+100法术强度/+50护甲/主动：让你的英雄凝滞2.5秒，冷却时间90秒"],"bold":false,"color":"#2a2727","must":false,"value":[]},{"type":"ChoiceQuestion","id":"6be4cf62-6ef6-8abe-754a-fb50f1ab920f","qindex":16,"single":true,"title":"以下哪个英雄不属于德玛西亚阵营？","items":["德玛西亚之力-盖伦","暗夜猎手-薇恩","嗜血猎手-沃里克","光辉女郎-拉克丝"],"bold":false,"color":"#2a2727","must":false,"value":[]}],"bold":true,"color":"#2a2727"},{"type":"SectionGroup","id":"9c68ad02-7bb0-528f-00e0-2662d6d12db2","title":"二,填进空题","children":[{"type":"SectionGroup","id":"1704776a-a12b-bdf8-d04d-8f5c6003a5c3","title":"请填出下列英雄的称号或名字","children":[],"bold":false,"color":"#2a2727"},{"type":"QuestionResponse","id":"f4a255c4-66e4-b34e-7c74-b068c226d7d5","qindex":17,"title":"末日使者","single":true,"bold":false,"color":"#2a2727","must":false,"value":""},{"type":"QuestionResponse","id":"9600d416-7204-db11-7b84-f414aded5430","qindex":18,"title":"斯卡纳","single":true,"bold":false,"color":"#2a2727","must":false,"value":""},{"type":"QuestionResponse","id":"e4818821-d965-c4cd-bbfb-10c8ef781bc4","qindex":19,"title":"战争之影","single":true,"bold":false,"color":"#2a2727","must":false,"value":""},{"type":"QuestionResponse","id":"48d9d52f-d54c-0f4e-2ac1-ee8a396a91e4","qindex":20,"title":"希维尔","single":true,"bold":false,"color":"#2a2727","must":false,"value":""},{"type":"QuestionResponse","id":"044ed463-8d44-786f-16be-a4caf13da5c7","qindex":21,"title":"艾尼维亚","single":true,"bold":false,"color":"#2a2727","must":false,"value":""}],"bold":true,"color":"#2a2727"},{"type":"SectionGroup","id":"ab99a732-d3e7-a541-e27e-81681d6c54cd","title":"三,计算器题","children":[{"type":"QuestionResponse","id":"efb7ea48-333d-5ab2-afdb-7c267adad956","qindex":22,"title":"一天狐狸和卡萨丁相约于中路单挑。 两人十八级的时候， 狐狸此时有300的法术强度，法术穿透为20点和20%，她的欺诈宝珠[Q]此时基础伤害为140（AP加成0.33），宝珠收回时基础伤害为140（AP加成为0.33），卡萨丁此时魔法抗性为100点，狐狸的欺诈宝珠从卡萨定丁身体里穿过并收回，请问卡萨丁将受到多少伤害。","single":false,"bold":false,"color":"#2a2727","must":false,"value":""},{"type":"QuestionResponse","id":"dfa1b153-dbd6-121b-139f-6e331ee189e3","qindex":23,"title":"LOL护甲魔抗低档的百分比是怎么计算，1护甲的时候抵挡是百分之1，可是100多护甲的时候抵挡百分之40左右，求教护甲和护甲抵抗的百分比公式","single":true,"bold":false,"color":"#2a2727","must":false,"value":""}],"bold":true,"color":"#2a2727"},{"type":"SectionGroup","id":"9a1782fd-17b2-5aa5-da5e-ef6604e6687d","title":"四,作文","children":[{"type":"QuestionResponse","id":"ad01beee-3de5-30f4-bfda-a8336d4d5fae","qindex":24,"title":"成就五杀抑或20投都是英雄主义谈谈你的感悟（不少于八百字）","single":true,"bold":false,"color":"#2a2727","must":false,"value":""}],"bold":true,"color":"#2a2727"}]}');
                        }
                    }()),
                    computed:{
                        exportStyle:function(){
                            return {
                                background:"#ffffff url(" + this.header.src + ') repeat fixed'
                            }
                        }
                    },
                    methods:{
                        save:function(){
                            var str = JSON.stringify(this.$data);
                            localStorage.data = str;
                        }
                    }
                })
            }
        }
    })
