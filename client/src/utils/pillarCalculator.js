import { Solar } from 'lunar-javascript';
import {
    heavenMapping,
    branchMapping,
    monthStemTable,
    stemAttributes,
    // branchAttributes,
    elementDescriptions,
    stemDetailedInterpretations,
    branchDetailedInterpretations,
    pillarSpecificInterpretations
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
    
    const interpretation = getDetailedInterpretation('연주', stemEntry[1], branchEntry[1]);
    
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
        interpretation
    };
};

/**
 * 월주의 계산 함수
 */
export const calculateMonthPillar = (year, month, day = 1) => {
    const solar = Solar.fromYmd(year, month, day);
    const lunar = solar.getLunar();
    const lunarMonth = lunar.getMonth();
    const branchIndex = (lunarMonth + 1) % 12;

    const yearPillar = calculateYearPillar(year);
    const group = Math.floor(yearPillar.stemIndex / 2);
    const stemIndex = monthStemTable[group][lunarMonth - 1];

    const stem = {
        key: Object.keys(heavenMapping)[stemIndex],
        value: Object.values(heavenMapping)[stemIndex],
    };
    const branch = {
        key: Object.keys(branchMapping)[branchIndex],
        value: Object.values(branchMapping)[branchIndex],
    };

    const interpretation = getDetailedInterpretation('월주', stem.value, branch.value);

    return {
        stem,
        branch,
        lunarMonth,
        interpretation
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

    const stem = {
        key: Object.keys(heavenMapping)[stemIndex],
        value: Object.values(heavenMapping)[stemIndex],
    };
    const branch = {
        key: Object.keys(branchMapping)[branchIndex],
        value: Object.values(branchMapping)[branchIndex],
    };

    const interpretation = getDetailedInterpretation('일주', stem.value, branch.value);

    return {
        stem,
        branch,
        stemIndex,
        interpretation
    };
};

/**
 * 시주의 계산 함수
 */
export const calculateTimePillar = (dayStemIndex, hour, minute = 0) => {
    const branchIndex = Math.floor((hour * 60 + minute) / 120) % 12;
    const stemStartIndex = [0, 2, 4, 6, 8][dayStemIndex % 5];
    const stemIndex = (stemStartIndex + Math.floor(branchIndex / 2)) % 10;

    const stem = {
        key: Object.keys(heavenMapping)[stemIndex],
        value: Object.values(heavenMapping)[stemIndex],
    };
    const branch = {
        key: Object.keys(branchMapping)[branchIndex],
        value: Object.values(branchMapping)[branchIndex],
    };

    const interpretation = getDetailedInterpretation('시주', stem.value, branch.value);

    return {
        stem,
        branch,
        interpretation
    };
};

/**
 * 전체 사주 계산 함수
 */
export const calculateSaju = (year, month, day, hour, minute = 0) => {
    const yearPillar = calculateYearPillar(year);
    const monthPillar = calculateMonthPillar(year, month, day);
    const dayPillar = calculateDayPillar(year, month, day);
    const timePillar = calculateTimePillar(dayPillar.stemIndex, hour, minute);

    // 전체 사주 종합 해석
    const overallInterpretation = generateOverallAnalysis(
        yearPillar.interpretation,
        monthPillar.interpretation,
        dayPillar.interpretation,
        timePillar.interpretation
    );

    return {
        year: {
            pillar: `${yearPillar.stem.value}${yearPillar.branch.value}`,
            details: yearPillar.interpretation,
        },
        month: {
            pillar: `${monthPillar.stem.value}${monthPillar.branch.value}`,
            details: monthPillar.interpretation,
        },
        day: {
            pillar: `${dayPillar.stem.value}${dayPillar.branch.value}`,
            details: dayPillar.interpretation,
        },
        time: {
            pillar: `${timePillar.stem.value}${timePillar.branch.value}`,
            details: timePillar.interpretation,
        },
        overall: overallInterpretation,
        elements: {
            yearElement: yearPillar.interpretation.elements,
            monthElement: monthPillar.interpretation.elements,
            dayElement: dayPillar.interpretation.elements,
            timeElement: timePillar.interpretation.elements,
        }
    };
};

// export const getDynamicInterpretation = (pillarType, pillar) => {
//     // 천간과 지지에 해당하는 속성 정보 조회
//     const stemAttr = stemAttributes[pillar.stem.value];
//     const branchAttr = branchAttributes[pillar.branch.value];

//     let interpretation = "";

//     if (stemAttr) {
//         interpretation += `천간(${pillar.stem.value}): ${stemAttr.description || "설명 없음"}. `;
//     } else {
//     interpretation += `천간(${pillar.stem.value})에 대한 정보가 없습니다. `;
//     }

//     if (branchAttr) {
//         interpretation += `지지(${pillar.branch.value}): ${branchAttr.description || "설명 없음"}. `;
//     } else {
//         interpretation += `지지(${pillar.branch.value})에 대한 정보가 없습니다. `;
//     }

//     // 각 기둥 고유의 의미를 동적으로 추가
//     switch (pillarType) {
//         case '연주':
//             interpretation += "연주는 조상, 가족, 사회적 배경의 영향을 반영하여 개인의 기본 성향에 큰 영향을 줍니다.";
//             break;
//         case '월주':
//             interpretation += "월주는 부모와 성장 과정, 감정 상태를 나타내며, 대인관계 및 직업적 성향에 영향을 미칩니다.";
//             break;
//         case '일주':
//             interpretation += "일주는 본인의 핵심 성격과 인생의 주된 방향을 결정하는 중요한 기둥입니다.";
//             break;
//         case '시주':
//             interpretation += "시주는 자녀, 후계자 및 미래의 가능성을 암시하여 인생의 최종 목표와 성취에 관여합니다.";
//             break;
//         default:
//             break;
//     }

//     return interpretation;
// };

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





// 조합 해석 함수
const getDetailedInterpretation = (pillarType, stem, branch) => {

    const stemInfo = stemDetailedInterpretations[stem] || {};
    const branchInfo = branchDetailedInterpretations[branch] || {};
    const pillarInfo = pillarSpecificInterpretations[pillarType] || {}; // 인생 방향이 좀 어색하고 고정된 값으로 수정이 필요

    return {
        basic: {
            stemNature: stemInfo.nature,
            branchNature: branchInfo.nature,
            combined: `${stem}${branch}`,
        },
        personality: {
            stemPersonality: stemInfo.personality,
            branchPersonality: branchInfo.personality,
            combinedTraits: `${stemInfo.personality || ''} ${branchInfo.personality || ''}`
        },
        characteristics: {
            strengths: `${stemInfo.strengths || ''} ${branchInfo.strengths || ''}`,
            weaknesses: `${stemInfo.weaknesses || ''} ${branchInfo.weaknesses || ''}`,
        },
        pillarContext: {
            significance: pillarInfo.significance,
            impact: pillarInfo.impact,
            focus: pillarInfo.focus
        },
        elements: {
            stemElement: stemInfo.element,
            branchElement: branchInfo.element
        }
    };
};

// 사주 전체 해석 함수
export const getComprehensiveSajuInterpretation = (yearPillar, monthPillar, dayPillar, timePillar) => {
    return {
        overall: generateOverallAnalysis(
            yearPillar.interpretation,
            monthPillar.interpretation,
            dayPillar.interpretation,
            timePillar.interpretation
        )
    };
};

// 종합 분석 생성 함수
const generateOverallAnalysis = (year, month, day, time) => {
    return {
        personalityOverview: `${year.personality.stemPersonality}, ${month.personality.stemPersonality}의 기질이 바탕이 되어 특히 ${day.personality.stemPersonality}한 면모가 두드러지며, ${time.personality.stemPersonality}의 영향 또한 느껴진다`,
        lifeDirection: `${year.pillarContext.significance}를 시작으로 ${month.pillarContext.impact}가 이어지며, 이는 ${day.pillarContext.focus}에 영향을 미치고 나아가 ${time.pillarContext.focus}로 연결된다`,
        recommendations: `${year.characteristics.strengths}을 바탕으로 하되, ${month.characteristics.weaknesses}에 유의하면서 ${day.characteristics.strengths}을 더욱 발전시키는 것이 바람직하다`
    };
};