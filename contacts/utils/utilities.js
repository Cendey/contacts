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

exports.toLiteral = function (source) {
    let result = "";
    if (source) {
        let counter = 0;
        if (!source.prototype) Object.setPrototypeOf(source, Object.prototype);
        for (let key in Object.keys(source)) {
            if (counter) result = result.concat('; ');
            result = result.concat(key).concat('=').concat(source[key]);
            ++counter;
        }
    }
    return result;
};