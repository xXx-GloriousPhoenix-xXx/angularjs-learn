function paginate(items, pageNum, pageSize) {
    const safePageSize = Math.min(100, Math.max(1, parseInt(pageSize, 10) || 10));
    const safePageNum  = Math.max(1, parseInt(pageNum, 10) || 1);
    const itemCount = items.length;
    const pageCount = Math.max(1, Math.ceil(itemCount / safePageSize));
    const start = (safePageNum - 1) * safePageSize;

    return {
        items: items.slice(start, start + safePageSize),
        itemCount,
        pageNum: safePageNum,
        pageSize: safePageSize,
        pageCount,
    };
}

module.exports = paginate;