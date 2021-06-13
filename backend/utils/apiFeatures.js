const apiFeatures = (query, queryString) => {
    const keyword = queryString.keyword ? {
        name: {
            $regex: queryString.keyword,
            $options: 'i'
        }
    } : {};

    // limit and skip variables for paginantion
    const responsePerPage = 4;
    const currentpage = Number(queryString.page) || 1;
    const skip = responsePerPage * (currentpage - 1);

    // Removing unwanted fileds from querystring and keeping only filter related fields
    const removeFields = ['keyword', 'limit', 'page'];
    removeFields.forEach(el => delete queryString[el]);
    
    // converting object to string so replace function can be used
    let mongoQuery = JSON.stringify(queryString);

    // converting queryString to mongodb query
    mongoQuery = JSON.parse(mongoQuery.replace(/\b(gt|gte|lt|lte)\b/g, match => `$${match}`));

    query = query.find({ ...keyword, ...mongoQuery }).limit(responsePerPage).skip(skip);
    return query;
}

module.exports = apiFeatures;