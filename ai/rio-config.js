const unknown='正確な内容は株式会社 吏央へ直接お問い合わせください。';
const salary='給与目安は、未経験者：日給11,000円〜15,000円、経験者：日給16,000円〜18,000円、職長：月給40万円〜50万円程度です。経験・資格・能力・勤務内容等で変動します。掲載中の求人票と条件が異なる場合があるため、応募先の最新条件を必ずご確認ください。給与額・採用を確約するものではありません。';
const links={
 jobs:{label:'求人ページ',href:'/recruit/'},
 apply:{label:'WEB応募・募集要項',href:'/recruit/'},
 phone:{label:'札幌本社に電話',href:'tel:0113748012'},
 yokohamaPhone:{label:'横浜支店に電話',href:'tel:0459303366'},
 contact:{label:'問い合わせ',href:'/#contact-form'},
 sapporo:{label:'札幌の求人',href:'/recruit/sapporo-entry/'},
 experienced:{label:'札幌の経験者求人',href:'/recruit/sapporo-experienced/'},
 company:{label:'会社情報',href:'/#company'},
 works:{label:'施工実績',href:'/sapporo/'}
};
const topics=[
 {label:'仕事内容を知りたい',terms:/仕事内容|解体|土工|現場|常用|請負|工事/,text:'吏央は解体工事・土工工事・とび工事・仮設工事を行っています。札幌は内装解体を中心に、横浜は新築現場の土工事を中心に取り組んでいます。作業・安全管理・配属の詳細は求人票と採用窓口でご確認ください。',cta:['jobs','works']},
 {label:'給料について',terms:/給与|給料|日給|月給|賃金|職長|手当/,text:salary,cta:['jobs','phone']},
 {label:'寮について',terms:/寮|入居|入寮|住まい/,text:'札幌の掲載求人では個室寮20室、寮費月5万円、電気・水道・ガス・Wi-Fi無料と案内されています。横浜は単身用個室寮、冷暖房・テレビ・大浴場・食事付きの記載があります。空室・即入居・入寮方法・横浜の費用は採用窓口へご確認ください。横浜求人の掲載期限は終了しているため、現在の条件と募集状況もお問い合わせください。',cta:['phone','yokohamaPhone','jobs']},
 {label:'未経験でも大丈夫？',terms:/未経験|経験がない|初めて|初心者/,text:'札幌の未経験者向け求人では、資材運び・片付け・清掃・作業補助から始め、先輩社員が基本を教えると案内しています。学歴・経験不問の記載があります。採用は面接等で決定します。',cta:['sapporo','apply','phone']},
 {label:'資格取得について',terms:/資格|免許|取得|会社負担/,text:'札幌の掲載求人は資格取得費用を全額会社負担と案内しています。横浜の掲載求人にも会社負担の記載がありますが、掲載期限は終了しています。対象資格・申請条件・未経験からの取得手順は採用窓口へご確認ください。',cta:['jobs','phone','yokohamaPhone']},
 {label:'札幌の求人',terms:/札幌|北海道/,text:'札幌本社の求人ページに経験者・未経験者向けの土木作業スタッフ募集が掲載されています。勤務地は札幌市内が中心です。最新の募集状況・勤務開始時期は採用窓口へご確認ください。',cta:['sapporo','experienced','phone']},
 {label:'横浜の求人',terms:/横浜|神奈川/,text:'横浜支店の土工求人は掲載期限（2026年9月30日）を過ぎています。募集継続・条件・応募方法は横浜支店へ直接お問い合わせください。採用や勤務開始日を確約することはできません。',cta:['yokohamaPhone','contact']},
 {label:'応募したい',terms:/応募|面接|勤務開始|採用|働きたい/,text:'求人ページで希望の拠点・職種を選び、募集要項のWEB応募先、または採用窓口への電話からご応募ください。札幌の掲載求人では面接1回、在職中の勤務開始日は相談可能と案内しています。採用や開始日の確約はできません。',cta:['apply','phone','yokohamaPhone','contact']},
 {label:'会社について',terms:/会社|本社|支店|事業|建設業許可/,text:'株式会社 吏央（りお）は札幌本社と横浜支店を拠点に、解体・土工・とび・仮設工事を行っています。建設業許可は北海道知事許可 石第21656号です。詳細は会社情報・許可通知書をご確認ください。',cta:['company','contact']}
];
export default {
 id:'rio',title:'吏央 AI案内',launch:'AIに質問',
 note:'登録情報からご案内します。端末内AIを有効にすると質問の意味から登録情報を探します。質問は外部送信・保存されません。',
 blocked:q=>/個人情報|社員の|従業員の|内部|財務|法律|違法|合法|労災|未公開|保証|確約/.test(q.normalize('NFKC')),
 footer:'応募先の最新条件を必ずご確認ください。個人情報は入力しないでください。',unknown,topics,links,
 answer(query){
  const q=query.normalize('NFKC').trim();
  if(/個人情報|社員の|従業員の|内部|財務|法律|違法|合法|労災|未公開|保証|確約/.test(q))return {text:unknown,cta:['contact','phone']};
  if(/相談|見積|発注|問い合わせ|問合せ/.test(q))return {text:'工事内容・場所・希望時期をお問い合わせ窓口からお知らせください。金額・工期・対応可否は担当者が確認してご案内します。',cta:['contact','phone','yokohamaPhone']};
  if(/電話|連絡先/.test(q))return {text:'札幌本社：011-374-8012、横浜支店：045-930-3366です。',cta:['phone','yokohamaPhone']};
  if(/横浜/.test(q))return topics[6];
  const priority=[topics[1],topics[2],topics[4],topics[3],topics[7],topics[5],topics[8],topics[0]];
  return priority.find(t=>t.terms.test(q))??{text:unknown,cta:['contact','phone']};
 }
};
