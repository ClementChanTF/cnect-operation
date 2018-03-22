let IntervalTree = require('interval-tree');

const isOfSameLength = (startArray, endArray) => {
    return (startArray && endArray && (startArray.length === endArray.length));
}

const hasSingleElement = (array) => {
    return (array && array.length === 1);
}

const isEmpty = (array) => {
    return (array && array.length === 0)
}
const isInteger = (value) => {
    return (value >= 0);
}
const isIdentical = (source, target) => {
    return (source.data[0] === target.low)
        && (source.data[1] === target.high)
        && source.data[2].stag === target.data.stag
        && source.data[2].etag === target.data.etag;
}

const getIntervalNode = (pair) => {
    let { stag, etag } = pair;
    return { low: stag.offset, high: etag.offset, data: pair };
}

const processStartEndRange = async (resolvedObject) => {
    return new Promise((resolve, reject) => {
        let { result, options } = resolvedObject;
        let { start_tag, end_tag } = options;

        let startArray = [];
        let endArray = [];

        if (start_tag)
            startArray = start_tag.trim().replace(/ /g, '').split(',');
        if (end_tag)
            endArray = end_tag.trim().replace(/ /g, '').split(',');

        let startEndPairs;
        if (isEmpty(startArray) || !isOfSameLength(startArray, endArray)) {
            return reject(`error : cannot found complete start end tags as pair(s)`);
        } else {
            //console.log(`isEmpty(startArray): ${isEmpty(startArray)}, isOfSameLength(startArray, endArray): ${isOfSameLength(startArray, endArray)}`);
            startEndPairs = startArray.map((stag, index) => {
                return ({ stag, etag: endArray[index] });
            })
            let errMsg = ''
            let properPairs = startEndPairs.map((pair) => {
                let { stag, etag } = pair;
                // let indexOfStartTag = result.find(item=>item.trim() === stag);
                // let indexOfEndTag = result.find(item=>item.trim() === etag);
                let indexOfStartTag = result.indexOf(stag);
                let indexOfEndTag = result.indexOf(etag);
                if (errMsg !== '') {
                    errMsg += "\n\t";
                }
                if (!isInteger(indexOfStartTag)) {
                    errMsg += `start tag ${stag} not found in csv file`
                }
                if (!isInteger(indexOfEndTag)) {
                    errMsg += (errMsg.length > 0) ? ", " : "";
                    errMsg += `end tag ${etag} not found in csv file`;
                }
                return {
                    stag: { uid: stag, offset: Math.min(indexOfStartTag, indexOfEndTag) },
                    etag: { uid: etag, offset: Math.max(indexOfStartTag, indexOfEndTag) }
                }
            })
            if (errMsg !== '') {
                return reject(errMsg);
            } else {
                return resolve({ result, options, properPairs });
            }
        }
    });
}

const processOverlapRange = async (resolvedObject) => {
    return new Promise((resolve, reject) => {
        let { result, options, properPairs } = resolvedObject;
        let { start_tag, end_tag } = options;

        let chunk = [];
        if (hasSingleElement(properPairs)) {
            // chunk.push(result.slice(properPairs[0].stag.offset, properPairs[0].etag.offset + 1));
            properPairs[0]['block'] = result.slice(properPairs[0].stag.offset, properPairs[0].etag.offset + 1)
            return resolve({ result, properPairs, options });
        } else {
            let overlapError = [];

            let intervalNodes = properPairs.map(getIntervalNode)
            const intervalTree = new IntervalTree(parseInt(intervalNodes.length / 2, 10));
            intervalNodes.forEach(node => {
                let { low, high, data } = node
                intervalTree.add([low, high, data]);
            });

            let overlapStatus = false;
            intervalNodes.forEach(node => {
                let { low, high } = node;
                let overlapArray = intervalTree.search(low, high);
                if (!isEmpty(overlapArray)) {
                    let deltaOverlayArray = overlapArray.filter((item) => !isIdentical(item, node))
                    if (!isEmpty(deltaOverlayArray)) {
                        overlapStatus = true;
                        let { stag, etag } = node.data;
                        overlapError.push(`start tag ${stag.uid} at line (${stag.offset}) is found overlapping with others`);
                    }
                }
            });
            if (overlapStatus) {
                return reject(`${overlapError.join('\n')}`);
            } else {
                properPair = properPairs.map((pair) => {
                    let block = result.slice(pair.stag.offset, pair.etag.offset + 1);
                    //chunk = [...chunk, ...block];
                    return pair['block'] = block;
                    // chunk.push(block);
                });
                return resolve({ result, properPairs, options });
            }
        }
    });
}

module.exports = {
    isOfSameLength,
    hasSingleElement,
    isEmpty,
    isInteger,
    isIdentical,
    getIntervalNode,
    processStartEndRange,
    processOverlapRange,
}