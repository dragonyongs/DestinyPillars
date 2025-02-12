import { stemDetailedInterpretation, elementProperties } from "../constants/mappings";

/**
 * 사주 기둥을 기반으로 직장운(취업/직장 관련 운세)을 해석하는 함수
 * 주요 입력: pillars (사주 기둥 객체), options (연도 범위, 출생년도 등)
 */
export function calculateCareerLuck(pillars, options = {}) {
    try {
        const { yearRangeStart, yearRangeEnd, birthYear } = options;
        
        // 일간(본인의 천간)과 오행 정보 추출
        const dayStem = pillars?.day?.stem?.value || '';
        let dayElement = stemDetailedInterpretation[dayStem]?.element;
        if (!dayElement && elementProperties[dayStem]) {
            dayElement = dayStem;
        }

        // 1. 일간 기본 특성 분석
        const basicAnalysis = analyzeBasicCharacteristics(dayStem, dayElement, elementProperties);
        
        // 2. 연간 운세 및 대운/세운 흐름 분석
        const yearlyAnalysis = {};
        let prevYearStem = null; // 전년도 천간 저장

        for (let year = Number(yearRangeStart); year <= Number(yearRangeEnd); year++) {
            const currentYearStem = calculateYearStem(year);
            const yearPillars = {
                year: { stem: { value: currentYearStem }, branch: { value: '' } },
                day: { stem: { value: dayStem } }
            };

            const age = year - birthYear + 1;
            const ageCharacteristic = getAgeCharacteristics(age);

            yearlyAnalysis[year] = {
                stem: currentYearStem,
                age: age,
                analysis: analyzeYearCharacteristics(year, yearPillars, prevYearStem, ageCharacteristic)
            };
            
            prevYearStem = currentYearStem;
        }
        
        return {
            year: Number(yearRangeStart),
            basicInfo: {
                dayStem,
                dayElement
            },
            basicAnalysis: {
                personality: basicAnalysis.personalityAnalysis,
                elementalHarmony: basicAnalysis.elementalHarmony,
                careerAdvice: basicAnalysis.careerAdvice,
                detailedAdvice: basicAnalysis.detailedAdvice
            },
            yearlyAnalysis,
            success: true
        };

    } catch (error) {
        console.error("Error in calculateCareerLuck:", error);
        return {
            year: Number(options.yearRangeStart),
            interpretation: "해석 중 오류가 발생했습니다. 기본적인 사주 정보를 확인해주세요."
        };
    }
}

/**
 * 연령대별 특성을 반환하는 함수
 * 30세 미만: 초기 경력, 30~39: 경력 성장, 40~49: 경력 정점, 50세 이상: 경력 성숙
 */
function getAgeCharacteristics(age) {
    if (age < 30) return "career_start";
    if (age < 40) return "career_growth";
    if (age < 50) return "career_peak";
    return "career_mature";
}

/**
 * 일간 기본 특성 분석 함수
 * dayStem과 dayElement를 바탕으로 성격, 오행 조화, 직업 조언 및 상세 조언을 반환
 */
function analyzeBasicCharacteristics(dayStem, dayElement, elementProperties) {
    let elementKey = dayElement;
    if (!elementKey && elementProperties[dayStem]) {
        elementKey = dayStem;
    }
    if (!elementKey || !elementProperties[elementKey]) {
        console.error(`No element mapping found for dayStem: ${dayStem} with dayElement: ${dayElement}`);
        return {
            personalityAnalysis: "기본 특성 정보가 부족합니다.",
            elementalHarmony: "오행 정보가 없습니다.",
            careerAdvice: "직장 생활에 도움이 될 조언을 제공할 수 없습니다."
        };
    }
    const elementInfo = elementProperties[elementKey];
    
    return {
        personalityAnalysis: `${elementInfo.personality}을 가지고 있으며, 특히 ${elementInfo.characteristics}이(가) 돋보입니다. 직장에서는 ${elementInfo.strengths}의 장점을 살려 ${elementInfo.career} 분야에서 뛰어난 성과를 낼 수 있습니다.`,
        elementalHarmony: `${elementKey}은(는) ${elementInfo.favorable.join(', ')}의 도움을 받아 안정감을 얻으며, ${elementInfo.unfavorable.join(', ')}의 영향이 과하면 균형을 잃을 수 있습니다.`,
        careerAdvice: `직장 생활에서는 ${elementInfo.strengths}을(를) 활용하되, ${elementInfo.weaknesses}에 주의하며 균형 잡힌 접근이 필요합니다.`,
        detailedAdvice: {
            strengths: elementInfo.strengths.split(',').map(s => s.trim()),
            weaknesses: elementInfo.weaknesses.split(',').map(w => w.trim()),
            recommendedFields: elementInfo.career.split(',').map(c => c.trim()),
            developmentAreas: elementInfo.characteristics.split(',').map(c => c.trim())
        }
    };
}

/**
 * 해당 연도의 천간을 계산하는 함수 (한자로 반환)
 * (예: 甲, 乙, ... , 癸)
 */
function calculateYearStem(year) {
    const stems = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
    return stems[(year - 4) % 10];
}

/**
 * 연도별 해석을 위한 함수
 * - 기본 운세, 나이대별 조언, 일간과의 관계, 전환기 조언, 상세 조언 및 경력 집중 항목을 포함
 */
function analyzeYearCharacteristics(year, pillars, lastYearStem = null, ageCharacteristic = '') {
    const currentYearStem = pillars.year.stem.value;
    const dayStem = pillars.day.stem.value;

    // 1. 기본 운세 해석
    const baseAnalysis = getBaseAnalysis(currentYearStem, year);
    
    // 2. 나이대별 조언
    const ageAdvice = getAgeBasedAdvice(ageCharacteristic, currentYearStem);
    
    // 3. 일간과의 관계 분석
    const dayRelationship = analyzeDayRelation(currentYearStem, dayStem);
    
    // 4. 전환기 분석 (전년도 천간과의 관계)
    let transitionAdvice = "";
    if (lastYearStem) {
        transitionAdvice = analyzeTransitionDetail(lastYearStem, currentYearStem, year);
    }

    return {
        generalLuck: baseAnalysis,
        ageSpecificAdvice: ageAdvice,
        dayRelationship: dayRelationship,
        transitionAdvice: transitionAdvice,
        detailedAdvice: generateDetailedAdvice(currentYearStem, ageCharacteristic),
        careerFocus: getCareerFocus(currentYearStem, ageCharacteristic)
    };
}

/**
 * 전년도 천간과 올해 천간의 전환 관계에 따른 상세 해석을 반환하는 함수
 */
function analyzeTransitionDetail(lastYearStem, currentYearStem, year) {
    const transitionDetailMapping = {
        "甲-乙": `${year}년은 작년 甲의 강인한 기운에서 벗어나, 乙의 부드러운 조화와 협력이 돋보이는 해입니다. 새로운 관계 형성과 변화의 기회가 많아, 기존 방식에서 벗어난 유연한 대처가 필요합니다.`,
        "乙-丙": `${year}년은 작년 乙의 유연함이 새로운 열정과 도전으로 이어지는 시기입니다. 적극적인 자세로 새로운 기회를 창출해야 합니다.`,
        "丙-丁": `${year}년은 작년 丙의 열정이 다소 과했다면, 丁의 신중한 분석과 계획으로 전환되어 안정적인 발전을 도모할 시기입니다. 침착하게 상황을 재정비해야 합니다.`,
        "丁-戊": `${year}년은 분석적 접근에서 실질적 성과로 전환되는 시기입니다. 구체적인 결과물을 만들어내는 데 집중해야 합니다.`,
        "戊-己": `${year}년은 안정된 기반 위에서 더 깊은 전문성을 추구하는 시기입니다. 내실을 다지는데 주력해야 합니다.`,
        "己-庚": `${year}년은 신중함에서 과감한 도전으로 전환되는 시기입니다. 새로운 도전을 두려워하지 말아야 합니다.`,
        "庚-辛": `${year}년은 강한 추진력이 섬세한 전략으로 바뀌는 시기입니다. 세부적인 계획 수립이 중요합니다.`,
        "辛-壬": `${year}년은 분석적 사고에서 창의적 도전으로 전환되는 시기입니다. 혁신적인 시도가 필요합니다.`,
        "壬-癸": `${year}년은 활발한 활동에서 안정적 정착으로 전환되는 시기입니다. 기존의 성과를 정리하고 체계화하는 것이 중요합니다.`,
        "癸-甲": `${year}년은 내면의 성찰에서 외부로의 도전으로 전환되는 시기입니다. 새로운 시작을 위한 준비가 필요합니다.`
    };

    const key = `${lastYearStem}-${currentYearStem}`;
    return transitionDetailMapping[key] || `${year}년은 특별한 전환점이 없는 해입니다.`;
}

/**
 * 기본 운세 해석을 반환하는 함수
 */
function getBaseAnalysis(stem, year) {
    const analyses = {
        "甲": `${year}년은 강인한 리더십과 결단력이 빛나는 해입니다. 특히 4월과 9월에 중요한 의사결정과 승진 기회가 있을 수 있으며, 새로운 프로젝트를 주도할 가능성이 높습니다. 팀 내 리더십을 발휘하되, 독단적 결정은 피해야 합니다.`,
        "乙": `${year}년은 창의적 사고와 유연한 대처가 필요한 시기입니다. 3월과 7월에 특히 좋은 기회가 올 수 있으며, 협업 프로젝트에서 탁월한 성과를 거둘 수 있습니다. 인적 네트워크 확장이 중요한 시기입니다.`,
        "丙": `${year}년은 열정과 도전정신이 두드러지는 해입니다. 5월과 10월에 주목할만한 성과가 예상되며, 특히 새로운 분야나 해외 관련 업무에서 기회가 올 수 있습니다. 다만 과도한 업무 스트레스에 주의해야 합니다.`,
        "丁": `${year}년은 전략적 사고와 섬세한 실행력이 중요한 시기입니다. 2월과 8월이 핵심적인 시기가 될 것이며, 특히 기술력과 전문성을 인정받을 수 있습니다. 내부 정치에는 가능한 한 거리를 두세요.`,
        "戊": `${year}년은 안정적 성장과 기반 구축의 해입니다. 6월과 11월에 중요한 성과가 예상되며, 특히 관리직이나 책임자 역할에서 역량을 발휘할 수 있습니다. 장기 프로젝트 계획에 집중하세요.`,
        "己": `${year}년은 내실 다지기와 역량 강화가 중요한 시기입니다. 1월과 7월이 핵심 시기이며, 교육이나 자기계발을 통한 성장이 두드러질 수 있습니다. 동료와의 긴밀한 협력관계 구축이 필요합니다.`,
        "庚": `${year}년은 혁신과 변화의 기운이 강한 해입니다. 4월과 10월에 주요 변화가 예상되며, 조직 개편이나 새로운 시스템 도입 과정에서 중요한 역할을 맡을 수 있습니다. 변화에 대한 적극적 태도가 필요합니다.`,
        "辛": `${year}년은 전문성과 기술력이 빛나는 시기입니다. 3월과 9월이 중요한 시기가 될 것이며, 특히 기술적 문제 해결이나 프로젝트 관리에서 뛰어난 성과를 낼 수 있습니다. 세부적인 계획 수립이 중요합니다.`,
        "壬": `${year}년은 창의적 도전과 혁신이 필요한 해입니다. 5월과 11월에 중요한 기회가 올 수 있으며, 특히 새로운 기술이나 시장 진출과 관련된 프로젝트에서 좋은 성과를 낼 수 있습니다. 과감한 결정이 필요할 때입니다.`,
        "癸": `${year}년은 지혜로운 판단과 균형 잡힌 접근이 중요한 시기입니다. 2월과 8월이 핵심 시기이며, 특히 조정자나 중재자로서의 역할이 두드러질 수 있습니다. 장기적 관점에서의 경력 계획이 필요합니다.`
    };
    return analyses[stem] || `${year}년은 전반적으로 안정적인 발전이 예상되는 해입니다.`;
}

/**
 * 연령대별 조언을 반환하는 함수
 * ageCharacteristic: "career_start", "career_growth" 등
 */
function getAgeBasedAdvice(ageCharacteristic, stem) {
    const advices = {
        career_start: {
            "甲": "초기 경력자로서 리더십 역량을 개발하는데 집중하세요. 멘토를 찾아 조언을 구하는 것이 도움이 될 것입니다.",
            "乙": "다양한 업무 경험을 쌓되, 특히 팀 프로젝트 참여를 통해 협업 능력을 키우세요.",
            "丙": "열정과 도전정신을 바탕으로 적극적으로 새로운 업무 기회에 도전하며 자신감을 쌓으세요.",
            "丁": "섬세한 계획 수립과 꾸준한 자기계발을 통해 기반을 다져 나가세요.",
            "戊": "체계적인 접근과 조직 내 신뢰 구축을 통해 점진적인 성장을 도모하세요.",
            "己": "내면을 다스리며 꾸준한 학습을 통해 전문성을 키우고 작은 성공을 반복하세요.",
            "庚": "도전적이면서도 실용적인 경험을 통해 혁신적인 아이디어를 실현할 기회를 모색하세요.",
            "辛": "철저한 준비와 세심한 분석을 통해 경력의 기초를 튼튼히 다지세요.",
            "壬": "창의적인 접근과 다양한 시도로 자신의 강점을 최대한 발휘하세요.",
            "癸": "융통성과 적응력을 바탕으로 다양한 업무에 도전하며 경험을 쌓으세요."
        },
        career_growth: {
            "甲": "중간 관리자로서 팀 리더십과 전략적 사고를 강화하고, 경험을 토대로 의사결정 능력을 향상시키세요.",
            "乙": "전문성을 심화하고 업계 동향을 파악하여 네트워크 확장에 집중하며 협업을 통한 성장을 도모하세요.",
            "丙": "프로젝트 관리와 실행력을 강화하며 자신만의 전문 분야를 개발하는 데 집중하세요.",
            "丁": "분석력과 창의력을 바탕으로 문제 해결 능력을 향상시키고, 팀원과의 소통으로 시너지를 창출하세요.",
            "戊": "안정적 성장을 위해 체계적인 업무 수행과 조직 내 협업을 강화하며 리더십을 발휘하세요.",
            "己": "지속적인 자기계발과 학습을 통해 전문 분야에서 경쟁력을 확보하고 팀의 중추적 역할을 수행하세요.",
            "庚": "혁신과 변화를 선도하는 자세로 새로운 프로젝트에 도전하며 리더십을 발휘할 기회를 모색하세요.",
            "辛": "세밀한 계획과 철저한 실행을 통해 성과를 극대화하고, 자신의 전문성을 강화하세요.",
            "壬": "창의적 아이디어와 실무 경험을 바탕으로 도전적인 프로젝트를 이끌며 문제 해결 능력을 강화하세요.",
            "癸": "균형 잡힌 사고와 전략적 판단력을 통해 팀의 성장을 도모하고, 장기적인 목표 설정에 집중하세요."
        }
        // 다른 연령대 조언(예: career_peak, career_mature)이 필요하다면 추가 가능
    };
    return advices[ageCharacteristic]?.[stem] || "현재 단계에서는 전문성 강화와 네트워크 확장에 집중하세요.";
}

/**
 * 일간과 년간의 관계에 따른 상세 분석을 반환하는 함수
 */
function analyzeDayRelation(yearStem, dayStem) {
    const relationKey = `${dayStem}-${yearStem}`;
    const relations = {
        "甲-乙": "올해는 자신의 고유한 업무 스타일을 발전시키기 좋은 시기입니다. 새로운 아이디어를 적극 도입하여 능력을 향상시키세요.",
        "乙-丙": "창의력과 실행력이 조화를 이루는 시기로, 새로운 프로젝트를 시작하기에 적합합니다. 아이디어를 현실화하고 팀과 협력하세요.",
        "丙-丁": "열정과 추진력이 강조되는 해입니다. 목표를 명확히 하고 적극적으로 행동하면 좋은 결과를 얻을 수 있습니다.",
        "丁-戊": "안정성과 신뢰성이 중요한 시기입니다. 꾸준한 노력과 성실함으로 신뢰를 쌓고, 장기 목표를 설정하세요.",
        "戊-己": "세부적인 계획 수립과 내실 다지기에 적합합니다. 역량을 강화하며 전문성을 높이세요.",
        "己-庚": "변화와 혁신의 기운이 강한 시기입니다. 도전과 변화를 두려워하지 말고 적극 수용하세요.",
        "庚-辛": "섬세함과 철저함이 요구됩니다. 세부적인 부분까지 신경 써 완성도를 높이세요.",
        "辛-壬": "유연성과 적응력이 중요한 시기입니다. 다양한 상황에 능동적으로 대처하며 새로운 환경에 빠르게 적응하세요.",
        "壬-癸": "지혜와 통찰력이 돋보입니다. 깊은 사고와 분석으로 문제를 해결하고 장기적인 관점에서 계획하세요.",
        "癸-甲": "새로운 시작과 도전의 기운이 강합니다. 과거 경험을 바탕으로 새로운 분야에 도전하고 영역을 확장하세요."
    };
    return relations[relationKey] || "기본적인 업무 역량 강화를 위해 꾸준히 노력하세요.";
}

/**
 * 상세 조언(주요 역량, 도전 과제, 개발 영역, 경력 기회)을 반환하는 함수
 */
function generateDetailedAdvice(stem, ageCharacteristic) {
    return {
        keySkillsToFocus: ["리더십", "의사소통", "프로젝트 관리"],
        potentialChallenges: ["업무 스트레스", "팀 내 갈등"],
        developmentAreas: ["전문성 강화", "네트워크 확장"],
        careerOpportunities: ["새로운 프로젝트", "승진 기회"]
    };
}

/**
 * 경력 집중(단기 목표, 장기 목표, 주요 프로젝트, 네트워킹 집중)을 반환하는 함수
 */
function getCareerFocus(stem, ageCharacteristic) {
    return {
        shortTermGoals: ["역량 강화", "팀워크 향상"],
        longTermGoals: ["리더십 개발", "전문성 확보"],
        keyProjects: ["주요 프로젝트 참여", "새로운 이니셔티브 주도"],
        networkingFocus: ["업계 네트워크 확장", "멘토 관계 구축"]
    };
}
