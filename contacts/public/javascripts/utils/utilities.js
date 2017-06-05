/**
 * <p>Project: MIT Library Practice</p>
 * <p>Description: utilities</p>
 * <p>Copyright: Copyright (c) 2017</p>
 * <p>Company: MIT Labs Co., Inc</p>
 *
 * @author <chao.deng@kewill.com>
 * @version 1.0
 * @since 1/15/2017
 */

function literal(source) {
    let result = "";
    if (source) {
        let counter = 0;
        for (let key in source) {
            if (source.hasOwnProperty(key)) {
                if (counter++) result = result.concat('; ');
                result = result.concat(key).concat('=').concat(source[key]);
            }
        }
    }
    return result;
}

module.exports = {
    literal
};