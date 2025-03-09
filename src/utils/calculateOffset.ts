export const calculateOffset = (page: number, pageSize: number =10) => {
    return page * pageSize - pageSize // <- page starts from 1
}