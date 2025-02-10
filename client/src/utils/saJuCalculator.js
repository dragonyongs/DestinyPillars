import { Solar } from 'lunar-javascript';

export const heavenlyStems = [
    "갑(甲)", "을(乙)", "병(丙)", "정(丁)", "무(戊)", 
    "기(己)", "경(庚)", "신(辛)", "임(壬)", "계(癸)"
];

export const earthlyBranches = [
    "자(子)", "축(丑)", "인(寅)", "묘(卯)", "진(辰)", 
    "사(巳)", "오(午)", "미(未)", "신(申)", "유(酉)", 
    "술(戌)", "해(亥)"
];

/* ===== 사주 기둥 계산 함수 ===== */
export const calculateYearPillar = (year) => {
    const baseYear = 1984; // 1984년은 갑자년
    const diff = year - baseYear;
    const stemIndex = (diff % 10 + 10) % 10;
    const branchIndex = (diff % 12 + 12) % 12;
    
    return {
        stem: heavenlyStems[stemIndex],
        branch: earthlyBranches[branchIndex],
        stemIndex: stemIndex
    };
};

// 월주의 계산 함수
export const calculateMonthPillar = (year, month, day) => {
    // 양력 → 음력 변환
    const solar = Solar.fromYmd(year, month, day);
    const lunar = solar.getLunar();
    const lunarMonth = lunar.getMonth(); // 음력 월 (1 ~ 12)

    // 월지(지지): 전통적으로 음력 1월은 인(寅), 2월은 묘(卯), …, 11월은 자(子), 12월은 축(丑)입니다.
    const branchIndex = (lunarMonth + 1) % 12;
    
    // 월간 천간 lookup table
    const monthStemTable = [
        [2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3],  // 그룹 0 (갑/을)
        [4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5],  // 그룹 1 (병/정)
        [6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7],  // 그룹 2 (무/기)
        [8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9],  // 그룹 3 (경/신)
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1]   // 그룹 4 (임/계)
    ];
    // 연주의 천간 인덱스로 그룹을 결정 (0,1 → 그룹 0, 2,3 → 그룹 1, 4,5 → 그룹 2, 6,7 → 그룹 3, 8,9 → 그룹 4)
    const yearPillar = calculateYearPillar(year);
    const group = Math.floor(yearPillar.stemIndex / 2);
    const stemIndex = monthStemTable[group][lunarMonth - 1];
    
    return {
        stem: heavenlyStems[stemIndex],
        branch: earthlyBranches[branchIndex],
        lunarMonth: lunarMonth // 변환된 음력 월 정보
    };
};

// 일주의 계산 함수
// 기준일: 1984년 2월 2일(갑자일)을 기준으로 하여, 두 날짜 사이의 일수를 구하고 60갑자를 순환시킵니다.
export const calculateDayPillar = (year, month, day) => {
    const baseDate = new Date(1984, 1, 2); // 1984년 2월 (월은 0부터 시작하므로 1)
    const targetDate = new Date(year, month - 1, day);
    const diffDays = Math.floor((targetDate - baseDate) / (1000 * 60 * 60 * 24));
    
    const index = (diffDays % 60 + 60) % 60;
    const stemIndex = index % 10;
    const branchIndex = index % 12;
    
    return {
        stem: heavenlyStems[stemIndex],
        branch: earthlyBranches[branchIndex],
        stemIndex: stemIndex
    };
};

// 시주의 계산 함수
// 시(時)는 2시간 단위로 구분하며, 시지와 시천간은 일주의 천간을 기준으로 계산합니다.
export const calculateTimePillar = (dayStemIndex, hour) => {
    // 시지 계산: (hour + 1) / 2로 각 2시간 구간을 결정 (예: 23~1시 → 자, 1~3시 → 축, …)
    const branchIndex = Math.floor((hour + 1) / 2) % 12;
    
    // 시주의 천간은 아래와 같이 일주의 천간에 따른 시작값을 사용하여 결정합니다.
    const stemStartIndex = {
        0: 0,  // 갑(甲) → 시천간: 갑(甲)
        1: 2,  // 을(乙) → 시천간: 병(丙)
        2: 4,  // 병(丙) → 시천간: 무(戊)
        3: 6,  // 정(丁) → 시천간: 경(庚)
        4: 8,  // 무(戊) → 시천간: 임(壬)
        5: 0,  // 기(己) → 시천간: 갑(甲)
        6: 2,  // 경(庚) → 시천간: 병(丙)
        7: 4,  // 신(辛) → 시천간: 무(戊)
        8: 6,  // 임(壬) → 시천간: 경(庚)
        9: 8   // 계(癸) → 시천간: 임(壬)
    }[dayStemIndex];
    
    const stemIndex = (stemStartIndex + Math.floor(branchIndex / 2)) % 10;
    
    return {
        stem: heavenlyStems[stemIndex],
        branch: earthlyBranches[branchIndex]
    };
};

// 전체 사주 계산 함수 (월주의 계산 시 day를 추가로 전달)
export const calculateSaju = (year, month, day, hour) => {
    const yearPillar = calculateYearPillar(year);
    const monthPillar = calculateMonthPillar(year, month, day);
    const dayPillar = calculateDayPillar(year, month, day);
    const timePillar = calculateTimePillar(dayPillar.stemIndex, hour);
    
    console.log('사주:', {
        연주: `${yearPillar.stem}${yearPillar.branch}`,
        월주: `${monthPillar.stem}${monthPillar.branch}`,
        일주: `${dayPillar.stem}${dayPillar.branch}`,
        시주: `${timePillar.stem}${timePillar.branch}`
    });
    
    return {
        year: `${yearPillar.stem}${yearPillar.branch}`,
        month: `${monthPillar.stem}${monthPillar.branch}`,
        day: `${dayPillar.stem}${dayPillar.branch}`,
        time: `${timePillar.stem}${timePillar.branch}`
    };
};

/* ===== 천간 관련 속성 ===== */

const stemAttributes = {
    "갑(甲)": { element: "목", yinYang: "양", summary: "성장과 창의력의 시기", description: "강한 성장력과 창의적인 성향을 가진다. 자기주도적인 성격으로, 세운 목표를 향해 직진하는 성향이 강하며," },
    "을(乙)": { element: "목", yinYang: "음", summary: "융통성과 인내의 시기", description: "부드럽고 유연한 성향으로, 타인의 의견을 잘 수용하고 조화를 이루려 한다. 그러나 때로는 지나치게 순응적일 수 있으며," },
    "병(丙)": { element: "화", yinYang: "양", summary: "활동적이고 에너지 넘치는 시기", description: "에너지 넘치고 활동적이다. 열정적이며 사람들에게 영향을 미치는 능력이 뛰어나지만, 때로는 지나친 활동으로 과도한 스트레스를 받을 수 있으며," },
    "정(丁)": { element: "화", yinYang: "음", summary: "내적 열정과 창의성의 시기", description: "부드럽고 세밀한 성격으로, 감정적이고 직관적인 면이 강하다. 다른 사람들의 감정을 잘 이해하고 돌보는 능력이 뛰어난 사람이며." },
    "무(戊)": { element: "토", yinYang: "양", summary: "안정적이고 균형 잡힌 시기", description: "안정감과 신뢰성을 중시하며, 뚜렷한 목표와 강한 의지를 가진다. 리더십이 뛰어나지만 때로는 고집이 강할 수 있으며," },
    "기(己)": { element: "토", yinYang: "음", summary: "세심함과 실용성의 시기", description: "겸손하고 차분한 성격으로, 세심하고 신중하게 결정을 내린다. 대체로 남의 도움을 받기보다는 스스로 해결하려는 경향이 강하며," },
    "경(庚)": { element: "금", yinYang: "양", summary: "결단력과 추진력의 시기", description: "강한 결단력과 추진력을 가지고 있으며, 자신의 목표를 위해 노력한다. 하지만 때로는 지나치게 직설적이고 강압적인 면이 있으며," },
    "신(辛)": { element: "금", yinYang: "음", summary: "결단력과 강인함의 시기", description: "섬세하고 신중한 성격으로, 사람들과의 관계에서 신뢰를 중요하게 생각한다. 그러나 지나치게 내성적이거나 사람들을 지나치게 의심할 수 있으며," },
    "임(壬)": { element: "수", yinYang: "양", summary: "지혜와 유연성의 시기", description: "지혜롭고 유연한 성격으로, 변화에 잘 적응하고 문제를 해결하는 능력이 뛰어나다. 그러나 가끔 지나치게 감정적일 수 있으며," },
    "계(癸)": { element: "수", yinYang: "음", summary: "침착함과 깊이 있는 사고의 시기", description: "차분하고 신중하며, 깊은 사고를 통해 상황을 분석하고 결정을 내린다. 때로는 지나치게 내성적이거나 스스로 갇혀 있을 수 있으며," }
};

const branchAttributes = {
    "자(子)": { element: "수", description: "지혜와 학문을 나타냄" },
    "축(丑)": { element: "토", description: "안정과 실용성을 나타냄" },
    "인(寅)": { element: "목", description: "성장과 새로운 시작을 나타냄" },
    "묘(卯)": { element: "목", description: "창의성과 조화로운 에너지를 나타냄" },
    "진(辰)": { element: "토", description: "변화와 전환의 시기" },
    "사(巳)": { element: "화", description: "에너지와 열정을 나타냄" },
    "오(午)": { element: "화", description: "활력과 활동성을 나타냄" },
    "미(未)": { element: "토", description: "실용성과 신뢰성을 나타냄" },
    "신(申)": { element: "금", description: "결단력과 실행력을 나타냄" },
    "유(酉)": { element: "금", description: "완성도와 정리의 기운" },
    "술(戌)": { element: "토", description: "성실함과 인내를 나타냄" },
    "해(亥)": { element: "수", description: "지혜와 통찰력을 나타냄" }
};

export const getPillarDescription = (pillarType, pillar) => {
    const stemDescription = stemAttributes[pillar.stem] ? stemAttributes[pillar.stem].description : "알 수 없음";
    const branchDescription = branchAttributes[pillar.branch] ? branchAttributes[pillar.branch].description : "알 수 없음";
    
    return `${pillarType}의 천간(${pillar.stem})은 ${stemDescription} 지지(${pillar.branch})는 ${branchDescription}을 나타냅니다.`;
};

const elementDescriptions = {
    목: {
        description: "생명력과 성장, 창의성을 의미합니다. 새로운 시작을 나타내며, 방향을 설정하고 성장하는 힘을 제공합니다.",
        strengths: "창의적이고, 계획을 세우는 데 뛰어나며, 도전적인 성격을 가집니다.",
        weaknesses: "때로는 지나치게 성급하게 행동하거나, 계획을 너무 빠르게 추진할 수 있습니다."
    },
    화: {
        description: "에너지, 열정, 활동성을 상징합니다. 강한 추진력과 열정을 제공하지만, 과한 에너지는 스트레스나 갈등을 초래할 수 있습니다.",
        strengths: "목표를 향한 열정이 넘치며, 사람들에게 에너지를 전달하는 능력이 뛰어납니다.",
        weaknesses: "너무 활동적이어서 체력적으로 고갈되거나, 때로는 지나치게 자만할 수 있습니다."
    },
    토: {
        description: "균형, 안정감, 중심을 나타냅니다. 모든 것을 지탱하는 기초적이고 실용적인 성격을 의미합니다.",
        strengths: "차분하고 신중하며, 실용적인 결정을 내리는 데 뛰어나고, 사람들에게 안정감을 제공합니다.",
        weaknesses: "가끔 지나치게 보수적이거나, 변화에 저항할 수 있습니다."
    },
    금: {
        description: "결단력, 단단함, 금전적 성공을 의미합니다. 목표 달성을 위한 결단력을 제공하고, 확고한 의지를 나타냅니다.",
        strengths: "결단력 있고, 목표를 향해 꾸준히 나아가는 성격을 가집니다. 강한 자기주도성을 보입니다.",
        weaknesses: "때로는 너무 강경하게 사람들을 대하거나, 융통성이 부족할 수 있습니다."
    },
    수: {
        description: "지혜, 유연함, 흐름을 상징합니다. 상황에 따라 유연하게 대응하며, 지혜롭게 상황을 처리합니다.",
        strengths: "상황에 맞게 유연하게 변화를 수용하고, 좋은 해결책을 제시할 수 있습니다.",
        weaknesses: "때로는 지나치게 흐름에 맡기거나, 명확한 방향을 제시하지 않을 수 있습니다."
    }
};

export const getStemAttributes = (stem) => {
    const attributes = stemAttributes[stem] || { element: "알 수 없음", yinYang: "알 수 없음", description: "알 수 없음" };
    const elementDesc = getElementDescription(attributes.element);
    return {
        ...attributes,
        elementDescription: elementDesc
    };
};

export const getElementDescription = (element) => {
    const description = elementDescriptions[element] || { description: "설명 없음", strengths: "강점 없음", weaknesses: "약점 없음" };
    return `${description.description}<br /> 강점: ${description.strengths},<br /> 약점: ${description.weaknesses}`;
};

/* ===== 지장간 계산 ===== */

const hiddenStems = {
    "자(子)": ["계(癸)"],  // 물의 성질, 지혜와 유연함
    "축(丑)": ["기(己)", "계(癸)"],  // 토와 물, 실용적이면서도 유연한 성향
    "인(寅)": ["갑(甲)", "병(丙)"],  // 목과 화, 성장과 에너지
    "묘(卯)": ["을(乙)"],  // 목의 성질, 섬세하고 신중한 성향
    "진(辰)": ["무(戊)", "을(乙)"],  // 토와 목, 실용적이고 계획적인 성향
    "사(巳)": ["병(丙)", "무(戊)"],  // 화와 토, 강한 의지와 에너지
    "오(午)": ["정(丁)"],  // 화의 성질, 열정적이고 활동적인 성향
    "미(未)": ["기(己)", "정(丁)"],  // 토와 화, 신중하면서도 열정적인 성향
    "신(申)": ["경(庚)"],  // 금의 성질, 결단력 있고 차가운 성향
    "유(酉)": ["신(辛)"],  // 금의 성질, 정밀하고 결단력 있는 성향
    "술(戌)": ["무(戊)", "경(庚)"],  // 토와 금, 신중하고 강한 의지를 가진 성향
    "해(亥)": ["임(壬)"],  // 수의 성질, 지혜롭고 유연한 성향
};

export const getHiddenStems = (branch) => hiddenStems[branch] || [];

export const getHiddenStemsDescription = (branch) => {
    const hidden = getHiddenStems(branch);
    if (hidden.length === 0) return "지장간 없음";
    
    return hidden.map(stem => {
        switch(stem) {
        case "계(癸)":
            return "계(癸): 지혜와 유연함, 물의 성질을 지니며 적응력이 뛰어남";
        case "기(己)":
            return "기(己): 실용적이고 신중함, 토의 성질을 지니며 안정적인 성향";
        case "갑(甲)":
            return "갑(甲): 목의 성질, 성장과 진취적인 에너지를 지니며 강한 의지를 나타냄";
        case "병(丙)":
            return "병(丙): 화의 성질, 강한 열정과 에너지를 지니며 추진력이 뛰어남";
        case "을(乙)":
            return "을(乙): 목의 성질, 섬세하고 신중하며 창의적인 성향을 지님";
        case "무(戊)":
            return "무(戊): 토의 성질, 실용적이고 신중하며 내면의 강한 의지를 나타냄";
        case "정(丁)":
            return "정(丁): 화의 성질, 창의적이고 강렬한 에너지를 지니며 사람을 이끄는 성향";
        case "경(庚)":
            return "경(庚): 금의 성질, 강한 의지와 결단력을 지니며 명확한 목표를 향해 나아감";
        case "신(辛)":
            return "신(辛): 금의 성질, 정밀하고 철저하며 신중한 성향을 지님";
        case "임(壬)":
            return "임(壬): 수의 성질, 지혜롭고 유연하며 신중하게 일을 처리하는 성향";
        default:
            return "알 수 없는 지장간";
        }
    }).join("<br />");
};

/* ===== 십신 계산 ===== */

const tenGodRelations = {
    비견: ["갑(甲)", "을(乙)"],
    겁재: ["병(丙)", "정(丁)"],
    식신: ["무(戊)"],
    상관: ["기(己)"],
    편재: ["경(庚)"],
    정재: ["신(辛)"],
    편관: ["임(壬)"],
    정관: ["계(癸)"],
    편인: ["갑(甲)", "병(丙)"],
    정인: ["정(丁)"]
};

const tenGodDescriptions = {
    비견: "비견은 같은 천간과의 관계로, 본인의 성향을 공유하며 서로 존중하는 관계입니다. 자존감이 강하고 자신의 의견을 잘 표현하지만, 때때로 독립적인 성향이 강할 수 있습니다.",
    겁재: "겁재는 자신의 일주와 같은 성질을 가진 천간과의 관계로, 때때로 경쟁적인 성향이 나타날 수 있습니다. 직설적이고 강한 의지를 지닌 특징이 있으며, 자주 갈등을 일으킬 수 있습니다.",
    식신: "식신은 자신의 일주와 상반되는 성질을 가진 천간으로, 창의적이고 열정적인 특성을 지니고 있습니다. 그러나 과도한 표현력으로 인해 때때로 지나친 행동을 할 수 있습니다.",
    상관: "상관은 독창적이고 대담한 성향을 지니며, 항상 새로운 것에 도전하고 변화하는 것을 좋아합니다. 그러나 때때로 지나치게 감정적으로 행동할 수 있습니다.",
    편재: "편재는 재물과 관련된 성향을 지니며, 경제적인 능력과 실용적인 사고방식을 가지고 있습니다. 때때로 물질적 욕구가 지나치게 강할 수 있습니다.",
    정재: "정재는 안정적이고 규범을 중시하는 성향을 지니며, 정직하고 신뢰할 수 있는 사람입니다. 사람들과의 관계에서 신뢰를 중요하게 여기며, 절제된 성향을 보입니다.",
    편관: "편관은 직관적이고 결단력이 강한 성향을 지니며, 상황에 따라 유연하게 대처하는 능력이 뛰어납니다. 그러나 때때로 지나친 고집이 나타날 수 있습니다.",
    정관: "정관은 규칙적이고 질서를 중요하게 여깁니다. 목표를 향해 차분하게 나아가며, 사람들과의 관계에서 신뢰와 권위를 중시합니다.",
    편인: "편인은 창의적이고 섬세한 성향을 지니며, 타인과의 교류를 중요하게 여깁니다. 때로는 자신을 과도하게 감추려는 성향이 있을 수 있습니다.",
    정인: "정인은 인내심과 지혜를 가지고 있으며, 깊은 사고와 자기성찰을 중시합니다. 타인의 의견을 존중하며, 조용하고 신중한 성향을 보입니다."
};

export const calculateTenGod = (dayStem, otherStem) => {
    for (const [god, stems] of Object.entries(tenGodRelations)) {
        if (stems.includes(otherStem)) return god;
    }
    return "없음";
};

export const getTenGodDescription = (tenGod) => {
    return tenGodDescriptions[tenGod] || "십신에 대한 설명 없음";
};

/* ===== 육친(六親) 계산 기능 ===== */
const yukChinMapping = {
    "비견": { 
        relationship: "형제", 
        explanation: "비견은 자신의 기운을 공유하는 관계로, 형제자매처럼 경쟁하면서도 서로의 개성을 보완합니다. 이들은 서로의 장점을 인정하고, 협력하여 성장할 수 있는 관계입니다. 비견은 개인의 사회적 관계를 형성하는 데 중요한 역할을 하며, 서로의 발전을 도모하는 긍정적인 영향을 미칩니다."
    },
    "겁재": { 
        relationship: "형제", 
        explanation: "겁재 역시 형제와 같이 동등한 경쟁 관계를 이루며, 때로는 갈등이 있을 수 있으나 기본적으로 서로를 이해하는 관계입니다. 겁재는 경쟁을 통해 서로의 한계를 시험하고, 이를 통해 개인의 성장을 촉진하는 역할을 합니다. 이 관계는 서로의 개성과 독립성을 존중하면서도, 협력의 중요성을 강조합니다."
    },
    "식신": { 
        relationship: "부모", 
        explanation: "식신은 부모처럼 보호와 양육의 역할을 하며, 조언과 지원을 통해 안정적인 에너지를 제공합니다. 이들은 개인의 성장과 발전을 도모하며, 필요한 자원을 제공하는 역할을 합니다. 식신은 개인의 삶에 긍정적인 영향을 미치며, 안정감과 지지를 통해 개인이 자신의 목표를 추구할 수 있도록 돕습니다."
    },
    "상관": { 
        relationship: "부모", 
        explanation: "상관은 부모의 역할과 유사하게, 강한 보호 본능과 함께 때로는 주도적인 영향을 미치는 관계입니다. 상관은 개인의 선택과 행동에 큰 영향을 미치며, 때로는 압박을 가할 수 있는 존재입니다. 이 관계는 개인의 성장 과정에서 중요한 역할을 하며, 부모와의 관계가 개인의 성격 형성에 미치는 영향을 나타냅니다."
    },
    "정재": { 
        relationship: "배우자", 
        explanation: "정재는 배우자와 같이 친밀하며, 상호 보완적이고 조화로운 관계를 나타냅니다. 이들은 서로의 강점을 인정하고, 함께 성장하는 관계로, 안정적이고 신뢰할 수 있는 파트너십을 형성합니다. 정재는 개인의 감정적 안정과 행복에 기여하며, 서로의 삶에 긍정적인 영향을 미칩니다."
    },
    "편재": { 
        relationship: "배우자", 
        explanation: "편재는 배우자처럼 서로의 재능과 에너지를 보완하며, 때로는 경제적 협력이나 동반자로서 작용합니다. 이 관계는 서로의 목표를 지원하고, 함께 성장하는 데 중점을 둡니다. 편재는 개인의 삶에 실질적인 도움을 주며, 서로의 성공을 위해 협력하는 관계입니다."
    },
    "정인": { 
        relationship: "자식", 
        explanation: "정인은 자식과 같이 순수하며, 성장과 발전을 도모하는 관계를 의미합니다. 이들은 서로의 가능성을 믿고, 지원하며, 긍정적인 영향을 미치는 존재입니다. 정인은 개인의 미래에 대한 희망과 비전을 제공하며, 서로의 성장을 위해 노력하는 관계입니다."
    },
    "편인": { 
        relationship: "자식", 
        explanation: "편인은 자식처럼 보호와 지원, 그리고 새로운 시작을 도모하는 역할을 나타냅니다. 이들은 개인의 성장과 발전을 위해 필요한 자원을 제공하며, 새로운 기회를 창출하는 데 도움을 줍니다. 편인은 개인의 삶에 긍정적인 변화를 가져오는 중요한 존재입니다."
    }   
};

// 지지 간의 합 또는 충 관계를 확인하는 함수
const checkBranchRelation = (branch1, branch2) => {
    const branchRelations2 = {
        합: [
            ["자", "축"], ["인", "해"], ["묘", "술"], ["진", "유"], ["사", "신"], ["오", "미"]
        ],
        충: [
            ["자", "오"], ["축", "미"], ["인", "신"], ["묘", "유"], ["진", "술"], ["사", "해"]
        ]
    };

    for (const [b1, b2] of branchRelations2.합) {
        if ((b1 === branch1 && b2 === branch2) || (b1 === branch2 && b2 === branch1)) {
            return "합";
        }
    }
    for (const [b1, b2] of branchRelations2.충) {
        if ((b1 === branch1 && b2 === branch2) || (b1 === branch2 && b2 === branch1)) {
            return "충";
        }
    }
    return null;
};

  // 육친(六親) 계산 함수(세부 해석 포함)
export const calculateYukChinFromPillarsDetailed = (pillars) => {
    const baseStem = pillars.day.stem; // 기준은 일주의 천간
    const result = {
        본인: { 
            value: baseStem, 
            interpretation: "일간[본인]은 자신의 기운과 기본 성향을 나타냅니다." 
        },
        관계들: [],
        분석: {
            육친_빈도: {},
            과다_부족_해석: [],
            합충_관계: []
        }
    };

    // 연주, 월주, 시주에 대해 반복적으로 계산
    const pillarMapping = [
        { key: "year", label: "연주" },
        { key: "month", label: "월주" },
        { key: "time", label: "시주" }
    ];

    pillarMapping.forEach(({ key, label }) => {
        const stem = pillars[key].stem;
        const branch = pillars[key].branch;
        const god = calculateTenGod(baseStem, stem);
        if (yukChinMapping[god]) {
            result.관계들.push({
                type: label,
                value: `${yukChinMapping[god].relationship} (${god})`,
                interpretation: yukChinMapping[god].explanation
            });
            // 육친 빈도 계산
            if (result.분석.육친_빈도[god]) {
                result.분석.육친_빈도[god]++;
            } else {
                result.분석.육친_빈도[god] = 1;
            }
        } else {
            result.관계들.push({
                type: label,
                value: "해당없음",
                interpretation: `${label}의 십신과의 관계가 명확하지 않습니다.`
            });
        }
    });

    // 육친 과다 및 부족 해석
    for (const [god, count] of Object.entries(result.분석.육친_빈도)) {
        if (count >= 3) {
            result.분석.과다_부족_해석.push(`${god}이(가) ${count}개로 과다합니다. 이는 해당 육친의 영향력이 강하게 작용함을 의미합니다.`);
        } else if (count <= 1) {
            result.분석.과다_부족_해석.push(`${god}이(가) ${count}개로 부족합니다. 이는 해당 육친의 영향력이 약함을 나타냅니다.`);
        }
    }

    // 지지 간의 합충 관계 분석
    const branches = pillarMapping.map(({ key }) => pillars[key].branch);
    for (let i = 0; i < branches.length; i++) {
        for (let j = i + 1; j < branches.length; j++) {
            const relation = checkBranchRelation(branches[i], branches[j]);
            if (relation) {
                result.분석.합충_관계.push(`${branches[i]}와(과) ${branches[j]}는 ${relation} 관계입니다.`);
            }
        }
    }
    
    return result;
};

/* ===== 대운/세운 계산 ===== */

export const calculateBigLuckStartAge = (birthMonth, gender) => {
    const adjustment = gender === "남" ? 5 : -5;
    return birthMonth + adjustment;
};

export const getBigLuckPeriods = (startAge) => {
    const periods = [];
    for (let i = 0; i < 8; i++) {
        const periodDescription = getBigLuckPeriodDescription(startAge, i);
        periods.push(`${periodDescription.startAge}세 ~ ${periodDescription.startAge + 10}세: ${periodDescription.description}`);
    }
    return periods.join("<br />");
};

export const getBigLuckPeriodDescription = (startAge, periodIndex) => {
    const periods = [
        { 
            element: "목", 
            description: "성장과 발전, 창의성의 시기. 새로운 시작이 많고 도전적인 기운이 흐릅니다." 
        },
        { 
            element: "화", 
            description: "에너지와 열정, 활동성이 강한 시기. 목표를 향해 끊임없이 추진하는 힘이 있습니다." 
        },
        { 
            element: "토", 
            description: "안정과 균형을 중시하는 시기. 목표에 대한 확고한 의지와 함께, 안정적인 기운이 흐릅니다." 
        },
        { 
            element: "금", 
            description: "결단력과 결정을 내리는 시기. 강한 의지와 목표 달성을 위한 추진력이 두드러집니다." 
        },
        { 
            element: "수", 
            description: "지혜와 유연함의 시기. 흐름을 타고, 문제를 유연하게 해결해 나가는 시기입니다." 
        },
        { 
            element: "목", 
            description: "다시 시작의 기운이 흐르는 시기. 창의적인 아이디어와 프로젝트가 성공적으로 진행될 가능성이 높습니다." 
        },
        { 
            element: "화", 
            description: "에너지와 열정이 넘치는 시기. 사회적 활동과 인간 관계에서 강력한 동기부여가 발생하는 시기입니다." 
        },
        { 
            element: "토", 
            description: "결단력과 집중력이 중요한 시기. 자신의 목표를 향해 묵묵히 나아가며 성공을 거두는 시기입니다." 
        }
    ];
    
    const periodStartAge = startAge + periodIndex * 10;
    const period = periods[periodIndex] || { element: "알 수 없음", description: "기운 설명 없음" };
    
    return {
        startAge: periodStartAge,
        element: period.element,
        description: period.description
    };
};

export const getYearlyLuckPeriods = (startYear) => {
    const years = [];
    for (let i = 0; i < 10; i++) {
        const yearDescription = getYearlyLuckPeriodDescription(startYear + i);
        years.push(`${yearDescription.year}년 : ${yearDescription.description}`);
    }
    return years.join("<br />");
};

export const getYearlyLuckPeriodDescription = (year) => {
    const elements = ["목", "화", "토", "금", "수"];
    const element = elements[year % 5]; // 5개 오행을 순차적으로 반복
    let description = "";
    
    switch (element) {
        case "목":
            description = "생명력과 성장, 창의성의 기운이 강한 해. 도전과 시작의 기운이 돋보입니다.";
            break;
        case "화":
            description = "에너지와 열정이 넘치는 해. 사람들에게 영향을 미치고 활동적인 성향이 두드러집니다.";
            break;
        case "토":
            description = "균형과 안정의 기운. 실용적이고 신중한 판단을 내리는 데 적합한 해입니다.";
            break;
        case "금":
            description = "결단력과 목표 달성의 해. 중요한 결정을 내리거나, 강한 의지를 가지고 행동하게 됩니다.";
            break;
        case "수":
            description = "지혜와 유연함의 기운. 변화와 흐름을 잘 타며, 상황에 맞게 적응하는 능력이 강조됩니다.";
            break;
        default:
            description = "알 수 없는 해.";
    }
    
    return {
        year,
        element,
        description
    };
};

/* ===== 지지 간 관계 ===== */

const branchRelations = {
    합: [["자(子)", "축(丑)"], ["인(寅)", "해(亥)"], ["진(辰)", "유(酉)"]],
    충: [["자(子)", "오(午)"], ["묘(卯)", "유(酉)"]],
    형: [["인(寅)", "사(巳)"], ["축(丑)", "술(戌)"]],
    파: [["자(子)", "유(酉)"], ["진(辰)", "미(未)"]],
    해: [["자(子)", "미(未)"], ["인(寅)", "술(戌)"]],
};

// 기존 getBranchRelation 함수
export const getBranchRelation = (branch1, branch2) => {
    for (const [relation, pairs] of Object.entries(branchRelations)) {
        if (pairs.some(([a, b]) =>
        (a === branch1 && b === branch2) || (a === branch2 && b === branch1)
        )) {
        return relation;
        }
    }
    return null;
};

// 연-월 관계 '합'에 대한 상세 해석 함수
export const getBranchRelationDetailed = (branch1, branch2) => {
    const relation = getBranchRelation(branch1, branch2) || "없음";
    let description = "";

    if (relation === "합") {
    if ((branch1 === "자(子)" && branch2 === "축(丑)") ||
        (branch1 === "축(丑)" && branch2 === "자(子)")) {
        description = "자(子)와 축(丑)의 합: 물의 성질과 토의 성질이 결합하여 재물운, 건강, 가정의 안정에 긍정적인 영향을 미칩니다.";
    } else if ((branch1 === "인(寅)" && branch2 === "해(亥)") ||
                (branch1 === "해(亥)" && branch2 === "인(寅)")) {
        description = "인(寅)과 해(亥)의 합: 목과 수의 조화로 창의력과 감성, 사회적 관계에서의 유연함을 강화합니다.";
    } else if ((branch1 === "진(辰)" && branch2 === "유(酉)") ||
                (branch1 === "유(酉)" && branch2 === "진(辰)")) {
        description = "진(辰)과 유(酉)의 합: 토와 금의 결합으로 실용성과 결단력이 보완되어 직업적 성공 및 목표 달성에 도움을 줍니다.";
    } else {
        description = "합 관계: 두 지지가 결합하여 상호 보완하며 전체 사주의 균형과 조화를 이루는 긍정적인 에너지를 형성합니다.";
    }
    } else {
    description = "해당 관계에 대한 세부 해석은 제공되지 않습니다.";
    }

    return { relation, description };
};

/* ===== 용신 추천, 신강/신약, 오행 균형 분석, 직업 추천 ===== */

const yongshinInterpretation = {
    목: "목이 부족하면 성장과 확장을 위한 에너지가 부족합니다. 적극적이고 창의적인 활동을 촉진하기 위해 목의 에너지를 강화하는 것이 좋습니다.",
    화: "화가 부족하면 열정과 추진력이 부족해 어려운 상황에서의 결단력이 떨어집니다. 화의 에너지를 보충하면 리더십과 활력을 키울 수 있습니다.",
    토: "토가 부족하면 안정성과 결단력이 부족할 수 있습니다. 토의 에너지를 강화하면 더 나은 현실감과 조직력 있는 삶을 살 수 있습니다.",
    금: "금이 부족하면 결단력과 집중력이 떨어질 수 있습니다. 금의 에너지를 보강하면 더 명확한 목표를 설정하고 성취할 수 있습니다.",
    수: "수가 부족하면 유연성과 직관력이 부족합니다. 수의 에너지를 강화하면 사람들과의 관계나 감정적 깊이를 더할 수 있습니다."
};

export const recommendYongshin = (elementCounts) => {
    const elements = ["목", "화", "토", "금", "수"];
    
    const minElement = elements.reduce(
        (min, el) => (elementCounts[el] < elementCounts[min] ? el : min),
        "목"
    );
    
    return {
        yongshin: minElement,
        interpretation: yongshinInterpretation[minElement]
    };
};

export const determineStrength = (elementCounts) => {
    const totalElements = Object.values(elementCounts).reduce((sum, count) => sum + count, 0);
    const dayElementStrength = totalElements;
    
    if (dayElementStrength >= 7) {
        return {
            strength: "신강",
            description: "매우 강한 상태: 오행의 기운이 지나치게 강해 주도적이고, 리더십을 발휘할 수 있습니다. 강한 결단력과 추진력을 가질 수 있지만, 과도한 강함이 갈등을 일으킬 수 있습니다."
        };
    } else if (dayElementStrength >= 5) {
        return {
            strength: "강",
            description: "강한 상태: 강한 에너지를 가지고 있으며, 주도적인 성향과 활발한 성격을 나타냅니다. 도전적인 성향과 결단력을 갖추고 있지만, 때로는 지나친 강함이 단점이 될 수 있습니다."
        };
    } else if (dayElementStrength >= 3) {
        return {
            strength: "중립",
            description: "중립적인 상태: 강함과 약함이 균형을 이루고 있어, 적당한 에너지 수준을 유지합니다. 상황에 따라 유연하게 대처할 수 있으며, 지나치게 강하지도 약하지도 않은 조화로운 상태입니다."
        };
    } else if (dayElementStrength >= 1) {
        return {
            strength: "약",
            description: "약한 상태: 에너지가 부족하고, 소극적인 성향이 강습니다. 자아 표현이나 결단력에서 어려움을 겪을 수 있으며, 외부의 영향을 많이 받을 수 있습니다."
        };
    } else {
        return {
            strength: "신약",
            description: "매우 약한 상태: 거의 모든 에너지가 부족해 내성적이고 수동적이며, 자원을 적절히 활용하는 데 어려움이 있습니다. 자신감 부족과 결단력 부족을 겪을 수 있습니다."
        };
    }
};

export const analyzeElementBalance = (elementCounts) => {
    return Object.entries(elementCounts)
        .map(([element, count]) => `${element}: ${count} `);
};

const elementJobs = {
    목: {
        직업: ["창업", "디자인", "교육"],
        설명: "목(木)은 성장과 확장을 상징하며, 창의적이고 변화를 추구하는 성향이 강습니다.",
        적합성: "새로운 아이디어 발굴과 기획이 필요한 직군",
        필요역량: ["창의력", "계획 능력", "리더십"],
    },
    화: {
        직업: ["엔터테인먼트", "기획", "마케팅"],
        설명: "화(火)는 에너지와 열정을 상징합니다. 감정적인 소통 능력이 뛰어나므로 사람과의 상호작용이 중요한 분야에 적합합니다.",
        적합성: "높은 에너지와 표현력이 필요한 직군",
        필요역량: ["커뮤니케이션", "기획력", "열정"],
    },
    토: {
        직업: ["부동산", "건설", "중개업"],
        설명: "토(土)는 안정성과 신뢰를 상징합니다. 실용적이고 조직적인 성향이 강하므로 안정성과 관리 능력이 필요한 직군에 적합합니다.",
        적합성: "구조적이고 안정적인 관리가 중요한 직군",
        필요역량: ["문제 해결 능력", "조직 관리", "실무 경험"],
    },
    금: {
        직업: ["재무", "IT", "기술직"],
        설명: "금(金)은 결단력과 논리를 상징합니다. 분석적 사고와 정밀성이 중요한 분야에서 두각을 나타냅니다.",
        적합성: "정확성과 분석력이 필요한 직군",
        필요역량: ["데이터 분석", "논리적 사고", "기술적 이해"],
    },
    수: {
        직업: ["상담", "연구", "예술"],
        설명: "수(水)는 유연성과 통찰력을 상징합니다. 깊이 있는 사고와 창조성이 필요한 직군에 적합합니다.",
        적합성: "창조적 혹은 깊이 있는 탐구가 필요한 직군",
        필요역량: ["공감 능력", "분석력", "창의력"],
    },
};

export const recommendJobsBasedOnBalance = (balance) => {
    const elementCountsObject = balance.reduce((acc, item) => {
        const [key, value] = item.split(": ").map(str => str.trim());
        acc[key] = parseInt(value, 10);
        return acc;
    }, {});
    
    const suggestions = [];
    const elements = ["목", "화", "토", "금", "수"];
    
    elements.forEach((element) => {
        if (elementCountsObject[element] === 0) {
            const jobInfo = elementJobs[element];
            suggestions.push(
                `⚠️ 당신은 ${element} 오행이 부족합니다.<br />\n            추천 직업: ${jobInfo.직업.join(", ")}<br />\n            설명: ${jobInfo.설명}<br />\n            적합성: ${jobInfo.적합성}<br />\n            필요 역량: ${jobInfo.필요역량.join(", ")}`
            );
        }
    });
    
    const dominantElement = elements.reduce((acc, curr) =>
        elementCountsObject[curr] > (elementCountsObject[acc] || 0) ? curr : acc
    );
    
    if (elementCountsObject[dominantElement] >= 4) {
        const jobInfo = elementJobs[dominantElement];
        suggestions.push(
            `✅ 당신은 ${dominantElement} 오행이 강합니다.<br />\n            추천 직업: ${jobInfo.직업.join(", ")}<br />\n            설명: ${jobInfo.설명}<br />\n            적합성: ${jobInfo.적합성}<br />\n            필요 역량: ${jobInfo.필요역량.join(", ")}`
        );
    }
    
    return suggestions.length > 0 ? suggestions.join("<br /><br />") : "균형 잡힌 상태입니다.";
};

const stemToElement = {
    "갑(甲)": "목", "을(乙)": "목", "병(丙)": "화", "정(丁)": "화",
    "무(戊)": "토", "기(己)": "토", "경(庚)": "금", "신(辛)": "금",
    "임(壬)": "수", "계(癸)": "수"
};

const elementMapping = {
    목: ['인(寅)', '묘(卯)', '진(辰)'],
    화: ['자(子)', '오(午)', '미(未)'],
    토: ['축(丑)', '신(申)', '술(戌)'],
    금: ['유(酉)', '해(亥)', '진(辰)'],
    수: ['자(子)', '해(亥)', '유(酉)']
};

export const calculateElementCounts = (saju, pillars) => {
    const elementCounts = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };
    // 첫 번째 파라미터 'saju'는 지지(branch)들의 배열로 가정합니다.
    saju.forEach(branch => {
        if (elementMapping.목.includes(branch)) elementCounts.목++;
        else if (elementMapping.화.includes(branch)) elementCounts.화++;
        else if (elementMapping.토.includes(branch)) elementCounts.토++;
        else if (elementMapping.금.includes(branch)) elementCounts.금++;
        else if (elementMapping.수.includes(branch)) elementCounts.수++;
    });

    // pillars는 객체로 전달되므로, Object.values로 각 기둥(pillar)을 순회합니다.
    Object.values(pillars).forEach(pillar => {
        const element = stemToElement[pillar.stem];
        if (element) {
            elementCounts[element] += 1;
        }
    });
    
    return elementCounts;
};

export const calculateElementCountsFromPillars = (pillars) => {
    const counts = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };

    // pillars 객체의 값들을 순회하여 천간(stem)에 해당하는 오행을 카운트합니다.
    Object.values(pillars).forEach(pillar => {
        const element = stemToElement[pillar.stem];
        if (element) {
        counts[element] += 1;
        }
    });

    return counts;
};

/**
 * 오행균형에 대한 해석을 반환하는 함수
 * 각 오행의 개수와 평균을 비교하여 부족, 적정, 과다를 판단하고,
 * 해당 오행의 기본 의미와 추천사항을 함께 출력합니다.
 *
 * @param {Object} elementCounts - { 목: number, 화: number, 토: number, 금: number, 수: number }
 * @returns {string} 오행균형 해석 텍스트
 */

export const getElementBalanceInterpretation = (elementCounts) => {
    const elementInterpretations = {
        목: {
            description: "성장과 창의력, 새로운 시작을 상징합니다.",
            recommendation: "창의력과 성장의 에너지가 일정 부분 존재하지만, 과도한 발현은 없음."
        },
        화: {
            description: "에너지와 열정, 추진력을 나타냅니다.",
            recommendation: "열정과 에너지가 강하나, 과도하면 충동적으로 작용할 수 있습니다."
        },
        토: {
            description: "안정감과 신뢰, 현실적 사고를 상징합니다.",
            recommendation: "안정적인 에너지가 있으나, 특별히 두드러지지 않습니다."
        },
        금: {
            description: "결단력, 규율, 조직력을 의미합니다.",
            recommendation: "조직적 사고와 체계적인 판단에 필요한 기운이 부족할 수 있습니다."
        },
        수: {
            description: "감성, 직관, 유연성을 나타냅니다.",
            recommendation: "감정 조절과 직관적 사고에 필수적인 요소로 부족하여 보완이 필요합니다."
        }
    };

    // 전체 오행 개수의 총합과 평균값을 계산합니다.
    const totalCount = Object.values(elementCounts).reduce((sum, count) => sum + count, 0);
    const averageCount = totalCount / 5;

    let interpretationText = "";
    for (const element in elementCounts) {
        const count = elementCounts[element];
        let balanceStatus = "";
        if (count < averageCount) {
            balanceStatus = "부족";
        } else if (count > averageCount) {
            balanceStatus = "과다";
        } else {
            balanceStatus = "적정";
        }
        interpretationText += `${element}(${elementInterpretations[element].description}): ${count}개 - ${balanceStatus}. ${elementInterpretations[element].recommendation}<br /><br />`;
    }

    return interpretationText;
};
