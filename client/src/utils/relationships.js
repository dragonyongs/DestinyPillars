import { 
    hiddenStems, 
    tenGodRelations, 
    yukChinMapping, 
    tenGodDescriptions,
    branchMapping,
    stemDescriptions,
    branchRelationDescriptions
} from '../constants/mappings';

/**
 * 입력값을 통일된 한자 형식으로 변환
 */
const normalizeBranch = (branch) => branchMapping[branch] || branch;

/**
 * 특정 지지의 지장간(숨은 천간) 반환 함수
 */
export const getHiddenStems = (branch) => hiddenStems[branch] || [];

/**
 * 지장간에 대한 설명 반환 함수
 */
export const getHiddenStemsDescription = (branch) => {
    const hidden = getHiddenStems(branch);
    if (!hidden.length) return "지장간 없음";

    return hidden.map(stem => stemDescriptions[stem] || "알 수 없는 지장간").join("<br />");
};

/**
 * 십신 계산 함수
 */
export const calculateTenGod = (dayStem, otherStem) => 
    Object.entries(tenGodRelations).find(([_, stems]) => stems.includes(otherStem))?.[0] || "없음";

/**
 * 십신 설명 반환 함수
 */
export const getTenGodDescription = (tenGod) => tenGodDescriptions[tenGod] || "십신에 대한 설명 없음";

/**
 * 육친(六親) 상세 계산 함수
 */
export const checkBranchRelation = (branch1, branch2) => {
    const branchRelationTypes = {
        합: ["子丑", "寅亥", "辰酉", "巳申", "午未"],
        충: ["子午", "丑未", "寅申", "卯酉", "辰戌", "巳亥"]
    };

    // 입력 값을 한자로 통일
    const normalizedPair = normalizeBranch(branch1) + normalizeBranch(branch2);

    for (const [type, pairs] of Object.entries(branchRelationTypes)) {
        if (pairs.includes(normalizedPair) || pairs.includes([...normalizedPair].reverse().join(''))) {
            return type;
        }
    }
    return null;
};

// export const calculateYukChinFromPillarsDetailed = (pillars) => {
//     const baseStem = pillars.day.stem.value; // 기준은 일주의 천간
//     const result = {
//         본인: { 
//             value: baseStem, 
//             interpretation: "일간[본인]은 자신의 기운과 기본 성향을 나타냅니다." 
//         },
//         관계들: [],
//         분석: {
//             육친_빈도: {},
//             과다_부족_해석: [],
//             합충_관계: []
//         }
//     };

//     // 연주, 월주, 시주에 대해 반복적으로 계산
//     const pillarMapping = [
//         { key: "year", label: "연주" },
//         { key: "month", label: "월주" },
//         { key: "time", label: "시주" }
//     ];

//     pillarMapping.forEach(({ key, label }) => {

//         const stem = pillars[key].stem.value;
//         const branch = pillars[key].branch.value;
//         const god = calculateTenGod(baseStem, stem);

//         if (!yukChinMapping[god]) {
//             console.warn(`십신 '${god}'이(가) 육친 매핑에 없습니다.`);
//         }

//         if (yukChinMapping[god]) {
//             result.관계들.push({
//                 type: label,
//                 value: `${yukChinMapping[god].relationship} (${god})`,
//                 interpretation: yukChinMapping[god].explanation
//             });
//             // 육친 빈도 계산
//             if (result.분석.육친_빈도[god]) {
//                 result.분석.육친_빈도[god]++;
//             } else {
//                 result.분석.육친_빈도[god] = 1;
//             }
//         } else {
//             result.관계들.push({
//                 type: label,
//                 value: "해당없음",
//                 interpretation: `${label}의 십신과의 관계가 명확하지 않습니다.`
//             });
//         }
//     });

//     // 육친 과다 및 부족 해석
//     for (const [god, count] of Object.entries(result.분석.육친_빈도)) {
//         if (count >= 3) {
//             result.분석.과다_부족_해석.push(`${god}이(가) ${count}개로 과다합니다. 이는 해당 육친의 영향력이 강하게 작용함을 의미합니다.`);
//         } else if (count <= 1) {
//             result.분석.과다_부족_해석.push(`${god}이(가) ${count}개로 부족합니다. 이는 해당 육친의 영향력이 약함을 나타냅니다.`);
//         }
//     }

//     // 지지 간의 합충 관계 분석
//     const branches = pillarMapping.map(({ key }) => pillars[key].branch.value);
//     for (let i = 0; i < branches.length; i++) {
//         for (let j = i + 1; j < branches.length; j++) {
//             const relation = checkBranchRelation(branches[i], branches[j]);
//             if (relation) {
//                 result.분석.합충_관계.push(`${branches[i]}와(과) ${branches[j]}는 ${relation} 관계입니다.`);
//             }
//         }
//     }
    
//     return result;
// };

export const calculateYukChinFromPillarsDetailed = (pillars) => {
    const baseStem = pillars.day.stem.value; // 기준은 일간
    const result = {
        self: { 
            value: baseStem, 
            interpretation: "일간[본인]은 자신의 기운과 기본 성향을 나타냅니다." 
        },
        relations: [],
        analysis: {
            frequency: {},
            excessDeficiencyInterpretations: [],
            branchRelations: []
        }
    };

    // 연주, 월주, 시주에 대해 반복
    const pillarMapping = [
        { key: "year", label: "연주" },
        { key: "month", label: "월주" },
        { key: "time", label: "시주" }
    ];

    pillarMapping.forEach(({ key, label }) => {
        const stem = pillars[key].stem.value;
        const branch = pillars[key].branch.value;
        const god = calculateTenGod(baseStem, stem);

        if (!yukChinMapping[god]) {
            console.warn(`십신 '${god}'이(가) 육친 매핑에 없습니다.`);
        }

        if (yukChinMapping[god]) {
            const relationEntry = {
                type: ` <br />${label}`,
                value: `${yukChinMapping[god].relationship} (${god})`,
                interpretation: yukChinMapping[god].explanation
            };

            // 중복 추가 방지를 위해 동일한 값과 해석이 없을 때만 추가
            const exists = result.relations.some(
                (rel) =>
                    rel.value === relationEntry.value &&
                    rel.interpretation === relationEntry.interpretation
            );

            if (!exists) {
                result.relations.push(relationEntry);
            }

            // 육친 빈도 계산
            result.analysis.frequency[god] = (result.analysis.frequency[god] || 0) + 1;
        } else {
            result.relations.push({
                type: label,
                value: "해당없음",
                interpretation: `${label}의 십신과의 관계가 명확하지 않습니다.`
            });
        }
    });

    // 과다 및 부족 해석
    for (const [god, count] of Object.entries(result.analysis.frequency)) {
        if (count >= 3) {
            result.analysis.excessDeficiencyInterpretations.push(
            `${god}이(가) ${count}개로 과다합니다. 이는 해당 육친의 영향력이 강하게 작용함을 의미합니다.`
            );
        } else if (count <= 1) {
            result.analysis.excessDeficiencyInterpretations.push(
            `${god}이(가) ${count}개로 부족합니다. 이는 해당 육친의 영향력이 약함을 나타냅니다.`
            );
        }
    }

    // 지지 간의 합충 관계 분석
    const branches = pillarMapping.map(({ key }) => pillars[key].branch.value);
    for (let i = 0; i < branches.length; i++) {
        for (let j = i + 1; j < branches.length; j++) {
            const relation = checkBranchRelation(branches[i], branches[j]);
            if (relation) {
                const branchRel = `${branches[i]}와(과) ${branches[j]}는 ${relation} 관계입니다.`;
                // 중복 제거
                if (!result.analysis.branchRelations.includes(branchRel)) {
                    result.analysis.branchRelations.push(branchRel);
                }
            }
        }
    }

    return result;
};

export const getBranchRelationDetailed = (branch1, branch2) => {
    const relation = checkBranchRelation(branch1, branch2) || "없음";

    // 두 지지를 정규화
    const norm1 = normalizeBranch(branch1);
    const norm2 = normalizeBranch(branch2);
    
    // 천간(지지)의 순서를 정의 (기본 순서)
    const zodiacOrder = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
    
    // 두 지지를 천간 순서에 따라 정렬
    const key = zodiacOrder.indexOf(norm1) <= zodiacOrder.indexOf(norm2)
        ? norm1 + norm2
        : norm2 + norm1;

    return { 
        relation, 
        description: branchRelationDescriptions[key] || "해당 관계에 대한 세부 해석은 제공되지 않습니다." 
    };
};


/**
 * 지지 간 관계 확인 함수
 */
// export const getBranchRelation = (branch1, branch2) => {
// for (const [relation, pairs] of Object.entries(branchRelations)) {
// if (pairs.some(([a, b]) =>
//     (a === branch1 && b === branch2) || (a === branch2 && b === branch1)
// )) {
//     return relation;
// }
// }
// return null;
// };

/**
 * 연-월 관계 '합' 상세 해석 함수
 */
// export const getBranchRelationDetailed = (branch1, branch2) => {
//     const relation = getBranchRelation(branch1, branch2) || "없음";
//     let description = "";

//     if (relation === "합") {
//     if ((branch1 === "자(子)" && branch2 === "축(丑)") ||
//         (branch1 === "축(丑)" && branch2 === "자(子)")) {
//         description = "자(子)와 축(丑)의 합: 물의 성질과 토의 성질이 결합하여 재물운, 건강, 가정의 안정에 긍정적인 영향을 미칩니다.";
//     } else if ((branch1 === "인(寅)" && branch2 === "해(亥)") ||
//                 (branch1 === "해(亥)" && branch2 === "인(寅)")) {
//         description = "인(寅)과 해(亥)의 합: 목과 수의 조화로 창의력과 감성, 사회적 관계에서의 유연함을 강화합니다.";
//     } else if ((branch1 === "진(辰)" && branch2 === "유(酉)") ||
//                 (branch1 === "유(酉)" && branch2 === "진(辰)")) {
//         description = "진(辰)과 유(酉)의 합: 토와 금의 결합으로 실용성과 결단력이 보완되어 직업적 성공 및 목표 달성에 도움을 줍니다.";
//     } else {
//         description = "합 관계: 두 지지가 결합하여 상호 보완하며 전체 사주의 균형과 조화를 이루는 긍정적인 에너지를 형성합니다.";
//     }
//     } else {
//     description = "해당 관계에 대한 세부 해석은 제공되지 않습니다.";
//     }

//     return { relation, description };
// };

// export const getBranchRelationDetailed = (branch1, branch2) => {
//     const relation = checkBranchRelation(branch1, branch2) || "없음";
//     console.log(branch1, branch2);
//     console.log(relation, relation);
    
//     const descriptions = {
//         "子丑": "자(子)와 축(丑)의 합: 재물운, 건강, 가정의 안정에 긍정적인 영향을 미칩니다.",
//         "寅亥": "인(寅)과 해(亥)의 합: 창의력과 감성, 사회적 관계에서 유연함을 강화합니다.",
//         "辰酉": "진(辰)과 유(酉)의 합: 실용성과 결단력이 보완되어 직업적 성공에 도움을 줍니다."
//     };

//     return { relation, description: descriptions[normalizeBranch(branch1) + normalizeBranch(branch2)] || "해당 관계에 대한 세부 해석은 제공되지 않습니다." };
// };
