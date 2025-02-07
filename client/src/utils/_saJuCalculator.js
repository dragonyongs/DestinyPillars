import { solar2lunar } from 'solarlunar';

export const heavenlyStems = ["갑", "을", "병", "정", "무", "기", "경", "신", "임", "계"];
export const earthlyBranches = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"];

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

export const calculateMonthPillar = (year, month, day) => {
    const lunar = solar2lunar(year, month, day);
    const lunarMonth = lunar.lMonth;
    
    const yearPillar = calculateYearPillar(year);
    const yearStem = yearPillar.stem;

    const monthStemStart = {
        "갑": 2, "을": 2, // 甲, 乙 → 3월(寅)부터 "丙" 시작
        "병": 4, "정": 4, // 丙, 丁 → 3월(寅)부터 "戊" 시작
        "무": 6, "기": 6, // 戊, 己 → 3월(寅)부터 "庚" 시작
        "경": 8, "신": 8, // 庚, 辛 → 3월(寅)부터 "壬" 시작
        "임": 0, "계": 0  // 壬, 癸 → 3월(寅)부터 "甲" 시작
    }[yearStem];

    const stemIndex = (monthStemStart + lunarMonth - 1) % 10;
    const branchIndex = (lunarMonth + 1) % 12; // 월지는 (寅=3월) 기준

    return {
        stem: heavenlyStems[stemIndex],
        branch: earthlyBranches[branchIndex]
    };
};

export const calculateDayPillar = (year, month, day) => {
    const baseDate = new Date(1984, 1, 2); // 기준: 1984년 2월 2일 (갑자일)
    const targetDate = new Date(year, month - 1, day);
    const diffDays = Math.floor((targetDate - baseDate) / (1000 * 60 * 60 * 24));

    const index = (diffDays % 60 + 60) % 60;
    const stem = heavenlyStems[index % 10];
    const branch = earthlyBranches[index % 12];

    return { stem, branch, stemIndex: index % 10 };
};

export const calculateTimePillar = (dayStemIndex, hour) => {
    const branchIndex = Math.floor((hour + 1) / 2) % 12; // 시지 계산
    const stemStartIndex = {
        0: 0,  // 갑 → 갑
        1: 2,  // 을 → 병
        2: 4,  // 병 → 무
        3: 6,  // 정 → 경
        4: 8,  // 무 → 임
        5: 0,  // 기 → 갑
        6: 2,  // 경 → 병
        7: 4,  // 신 → 무
        8: 6,  // 임 → 경
        9: 8   // 계 → 임
    }[dayStemIndex];

    const stemIndex = (stemStartIndex + Math.floor(branchIndex / 2)) % 10;

    return {
        stem: heavenlyStems[stemIndex],
        branch: earthlyBranches[branchIndex]
    };
};

// 전체 사주 계산 함수
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
    갑: { element: "목", yinYang: "양" },
    을: { element: "목", yinYang: "음" },
    병: { element: "화", yinYang: "양" },
    정: { element: "화", yinYang: "음" },
    무: { element: "토", yinYang: "양" },
    기: { element: "토", yinYang: "음" },
    경: { element: "금", yinYang: "양" },
    신: { element: "금", yinYang: "음" },
    임: { element: "수", yinYang: "양" },
    계: { element: "수", yinYang: "음" },
};

const elementDescriptions = {
    목: "생명력과 성장, 창의성을 의미합니다.",
    화: "에너지, 열정, 활동성을 상징합니다.",
    토: "균형, 안정감, 중심을 나타냅니다.",
    금: "결단력, 단단함, 금전적 성공을 의미합니다.",
    수: "지혜, 유연함, 흐름을 상징합니다.",
};

export const getStemAttributes = (stem) => {
    return stemAttributes[stem] || { element: "알 수 없음", yinYang: "알 수 없음" };
};

export const getElementDescription = (element) => {
    return elementDescriptions[element] || "설명 없음";
};

/* ===== 지장간 계산 ===== */

const hiddenStems = {
    자: ["계"],
    축: ["기", "계"],
    인: ["갑", "병"],
    묘: ["을"],
    진: ["무", "을"],
    사: ["병", "무"],
    오: ["정"],
    미: ["기", "정"],
    신: ["경"],
    유: ["신"],
    술: ["무", "경"],
    해: ["임"],
};

export const getHiddenStems = (branch) => hiddenStems[branch] || [];

/* ===== 십신 계산 ===== */

const tenGodRelations = {
    비견: ["갑", "을"],
    겁재: ["병", "정"],
    식신: ["무"],
    상관: ["기"],
    편재: ["경"],
    정재: ["신"],
    편관: ["임"],
    정관: ["계"],
    편인: ["갑", "병"],
    정인: ["정"],
};

export const calculateTenGod = (dayStem, otherStem) => {
    for (const [god, stems] of Object.entries(tenGodRelations)) {
        if (stems.includes(otherStem)) return god;
    }
    return "없음";
};

/* ===== 대운/세운 계산 ===== */

// 대운 시작 나이 및 기간
export const calculateBigLuckStartAge = (birthMonth, gender) => {
    const adjustment = gender === "남" ? 5 : -5;
    return birthMonth + adjustment;
};

export const getBigLuckPeriods = (startAge) => {
    const periods = [];
    for (let i = 0; i < 8; i++) {
        periods.push(startAge + i * 10);
    }
    return periods;
};

// 세운 리스트 (연간 운)
export const getYearlyLuckPeriods = (startYear) => {
    const years = [];
    for (let i = 0; i < 10; i++) {
        years.push(startYear + i);
    }
    return years;
};

/* ===== 지지 간 관계 ===== */

const branchRelations = {
    합: [["자", "축"], ["인", "해"], ["진", "유"]],
    충: [["자", "오"], ["묘", "유"]],
    형: [["인", "사"], ["축", "술"]],
    파: [["자", "유"], ["진", "미"]],
    해: [["자", "미"], ["인", "술"]],
};

export const getBranchRelation = (branch1, branch2) => {
    for (const [relation, pairs] of Object.entries(branchRelations)) {
        if (pairs.some(([a, b]) => (a === branch1 && b === branch2) || (a === branch2 && b === branch1))) {
            return relation;
        }
    }
    return null;
};

/* ===== 용신 추천, 신강/신약, 오행 균형 분석, 직업 추천 ===== */

export const recommendYongshin = (elementCounts) => {
    const elements = ["목", "화", "토", "금", "수"];
    const minElement = elements.reduce(
        (min, el) => (elementCounts[el] < elementCounts[min] ? el : min),
        "목"
    );
    return minElement;
};

export const determineStrength = (dayElementStrength) => {
    return dayElementStrength >= 5 ? "신강" : "신약";
};

export const analyzeElementBalance = (elementCounts) => {
    return Object.entries(elementCounts)
        .map(([element, count]) => `${element}: ${count}개`)
        .join(", ");
};

const elementJobs = {
    목: ["창업", "디자인", "교육"],
    화: ["엔터테인먼트", "기획", "마케팅"],
    토: ["부동산", "건설", "중개업"],
    금: ["재무", "IT", "기술직"],
    수: ["상담", "연구", "예술"],
};

const stemToElement = {
    갑: "목", 을: "목",
    병: "화", 정: "화",
    무: "토", 기: "토",
    경: "금", 신: "금",
    임: "수", 계: "수"
};

export const calculateElementCountsFromPillars = (pillars) => {
    const counts = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };
    pillars.forEach(pillar => {
        const element = stemToElement[pillar.stem];
        if (element) {
        counts[element] += 1;
        }
    });
    return counts;
};

export const recommendJobs = (element) => elementJobs[element] || [];