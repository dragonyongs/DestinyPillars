import { yongshinInterpretation } from '../constants/mappings';

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