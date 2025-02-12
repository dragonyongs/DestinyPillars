import { Solar } from 'lunar-javascript';
import {
    heavenMapping,
    branchMapping,
    monthStemTable,
    stemAttributes,
    branchAttributes,
    elementDescriptions,
} from '../constants/mappings';

/**
 * 연주의 계산 함수
 */
export const calculateYearPillar = (year) => {
    const baseYear = 1984; // 기준 연도 (갑자년)
    const diff = year - baseYear;
    const stemIndex = (diff % 10 + 10) % 10;
    const branchIndex = (diff % 12 + 12) % 12;

    const stemEntry = Object.entries(heavenMapping)[stemIndex];
    const branchEntry = Object.entries(branchMapping)[branchIndex];
    
    return {
        stem: {
            key: stemEntry[0],
            value: stemEntry[1]
        },
        branch: {
            key: branchEntry[0],
            value: branchEntry[1]
        },
        stemIndex,
    };
};

/**
 * 월주의 계산 함수
 */
export const calculateMonthPillar = (year, month, day=1) => {
    const solar = Solar.fromYmd(year, month, day);
    const lunar = solar.getLunar();
    const lunarMonth = lunar.getMonth();
    const branchIndex = (lunarMonth + 1) % 12;

    const yearPillar = calculateYearPillar(year);
    const group = Math.floor(yearPillar.stemIndex / 2);
    const stemIndex = monthStemTable[group][lunarMonth - 1];

    return {
        stem: {
            key: Object.keys(heavenMapping)[stemIndex], // 키 값
            value: Object.values(heavenMapping)[stemIndex] // 벨류 값
        },
        branch: {
            key: Object.keys(branchMapping)[branchIndex], // 키 값
            value: Object.values(branchMapping)[branchIndex] // 벨류 값
        },
        lunarMonth
    };
};

/**
 * 일주의 계산 함수
 */
export const calculateDayPillar = (year, month, day) => {
    const baseDate = new Date(1984, 1, 2);
    const targetDate = new Date(year, month - 1, day);
    const diffDays = Math.floor((targetDate - baseDate) / (1000 * 60 * 60 * 24));

    const stemIndex = (diffDays % 10 + 10) % 10;
    const branchIndex = (diffDays % 12 + 12) % 12;

    return {
        stem: {
            key: Object.keys(heavenMapping)[stemIndex], // 키 값
            value: Object.values(heavenMapping)[stemIndex] // 벨류 값
        },
        branch: {
            key: Object.keys(branchMapping)[branchIndex], // 키 값
            value: Object.values(branchMapping)[branchIndex] // 벨류 값
        },
        stemIndex,
    };
};

/**
 * 시주의 계산 함수
 */
export const calculateTimePillar = (dayStemIndex, hour, minute) => {
    // const branchIndex = Math.floor((hour + 1) / 2) % 12;
    // const stemStartIndex = [0, 2, 4, 6, 8][dayStemIndex % 5];
    // const stemIndex = (stemStartIndex + Math.floor(branchIndex / 2)) % 10;
    const branchIndex = Math.floor((hour * 60 + minute) / 120) % 12;
    const stemStartIndex = [0, 2, 4, 6, 8][dayStemIndex % 5];
    const stemIndex = (stemStartIndex + Math.floor(branchIndex / 2)) % 10;
    
    return {
        stem: {
            key: Object.keys(heavenMapping)[stemIndex], // 키 값
            value: Object.values(heavenMapping)[stemIndex] // 벨류 값
        },
        branch: {
            key: Object.keys(branchMapping)[branchIndex], // 키 값
            value: Object.values(branchMapping)[branchIndex] // 벨류 값
        },
    };
};

/**
 * 전체 사주 계산 함수
 */
export const calculateSaju = (year, month, day, hour) => {
    const yearPillar = calculateYearPillar(year);
    const monthPillar = calculateMonthPillar(year, month, day);
    const dayPillar = calculateDayPillar(year, month, day);
    const timePillar = calculateTimePillar(dayPillar.stemIndex, hour);

    return {
        year: `${yearPillar.stem}${yearPillar.branch}`,
        month: `${monthPillar.stem}${monthPillar.branch}`,
        day: `${dayPillar.stem}${dayPillar.branch}`,
        time: `${timePillar.stem}${timePillar.branch}`,
    };
};

/**
 * 사주의 천간/지지 설명 함수
 */
export const getPillarDescription = (pillarType, pillar) => {
    const stemDesc = stemAttributes[pillar.stem.value]?.description || "알 수 없음";
    const branchDesc = branchAttributes[pillar.branch.value]?.description || "알 수 없음";

    return `${pillarType}의 천간(${pillar.stem.value})은 ${stemDesc}, 지지(${pillar.branch.value})는 ${branchDesc}을 나타냅니다.`;
};

/**
 * 천간 속성 반환 함수
 */
export const getStemAttributes = (stem) => ({
    ...stemAttributes[stem],
    elementDescription: getElementDescription(stemAttributes[stem]?.element || "알 수 없음"),
});

/**
 * 오행 설명 반환 함수
 */
export const getElementDescription = (element) => {
    const { description = "설명 없음", strengths = "강점 없음", weaknesses = "약점 없음" } = elementDescriptions[element] || {};
    return `${description}<br />강점: ${strengths},<br />약점: ${weaknesses}`;
};


// export const getStemAttributes = (stem) => {
//     const attributes = stemAttributes[stem] || { element: "알 수 없음", yinYang: "알 수 없음", description: "알 수 없음" };
//     const elementDesc = getElementDescription(attributes.element);
//     return { ...attributes, elementDescription: elementDesc };
// };


// export const getElementDescription = (element) => {
//     const description = elementDescriptions[element] || { description: "설명 없음", strengths: "강점 없음", weaknesses: "약점 없음" };
//     return `${description.description}<br /> 강점: ${description.strengths},<br /> 약점: ${description.weaknesses}`;
// };