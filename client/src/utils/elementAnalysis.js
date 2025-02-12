import { elementMapping, stemToElement, elementJobs, elementInterpretations } from '../constants/mappings';

/**
 * 지지와 기둥을 모두 고려하여 오행 개수를 계산하는 함수
 */

export const calculateElementCounts = (sajuBranches = [], pillars = {}) => {
    const elementCounts = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };
    
    // 지지 데이터 처리
    sajuBranches.forEach(branch => {
        Object.entries(elementMapping).forEach(([element, branches]) => {
        if (branches.includes(branch)) elementCounts[element]++;
        });
    });

    // 기둥 데이터 처리
    Object.values(pillars).forEach(pillar => {
        const element = stemToElement[pillar.stem];
        if (element) elementCounts[element]++;
    });

    return elementCounts;
};

/**
 * 오행 균형 해석 함수
 */
export const getElementBalanceInterpretation = (elementCounts) => {
    const totalCount = Object.values(elementCounts).reduce((sum, count) => sum + count, 0);
    const averageCount = totalCount / 5;

    return Object.entries(elementCounts)
        .map(([element, count]) => {
        const balanceStatus = count < averageCount ? "부족" : count > averageCount ? "과다" : "적정";
        return `${element} (${elementInterpretations[element].description}): ${count}개 - ${balanceStatus}. ${elementInterpretations[element].recommendation}<br /><br />`;
        })
        .join("");
};

/**
 * 오행 균형 요약 문자열 반환 함수
 */
export const analyzeElementBalance = (elementCounts) => {
    return Object.entries(elementCounts)
        .map(([element, count]) => `${element}: ${count}`)
        .join(" ");
};

/**
 * 직업 추천 함수 (오행 균형 기반)
 */
export const recommendJobsBasedOnBalance = (balance) => {
    const elements = ["목", "화", "토", "금", "수"];
    const suggestions = [];

    // 부족한 오행 확인
    elements.forEach((element) => {
        if (balance[element] <= 0) { 
            const { 직업, 설명, 적합성, 필요역량 } = elementJobs[element];
            suggestions.push(
                `⚠️ ${element} 오행이 부족합니다.<br />
                추천 직업: ${직업.join(", ")}<br />
                설명: ${설명}<br />
                적합성: ${적합성}<br />
                필요 역량: ${필요역량.join(", ")}`
                );
            }
        });
    
    // 강한 오행 확인
    const dominantElement = elements.reduce(
        (max, element) => (balance[element] > balance[max] ? element : max),
        elements[0]
    );

    if (balance[dominantElement] >= 4) {
        const { 직업, 설명, 적합성, 필요역량 } = elementJobs[dominantElement];
        suggestions.push(
            `✅ ${dominantElement} 오행이 강합니다.<br />
            추천 직업: ${직업.join(", ")}<br />
            설명: ${설명}<br />
            적합성: ${적합성}<br />
            필요 역량: ${필요역량.join(", ")}`
        );
    }
    
    return suggestions.length > 0 ? suggestions.join("<br /><br />") : "균형 잡힌 상태입니다.";
};

/**
 * 에너지 강도 판단 함수
 */
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