export interface Pagable<T> {
    items: T[],
    pageNum: number,
    pageSize: number,
    pageCount: number,
    itemCount: number
}
