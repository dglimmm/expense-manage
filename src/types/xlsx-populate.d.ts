/**
 * xlsx-populate는 자체 타입 정의를 제공하지 않으므로, 이 프로젝트에서 사용하는 API만 최소 선언한다.
 */
declare module 'xlsx-populate' {
  interface Cell {
    value(value: string | number | Date): Cell
    value(): string | number | boolean | Date | undefined
  }

  interface Sheet {
    cell(address: string): Cell
  }

  interface Workbook {
    sheet(nameOrIndex: number | string): Sheet
    outputAsync(): Promise<Buffer>
  }

  interface XlsxPopulateStatic {
    fromFileAsync(path: string): Promise<Workbook>
  }

  const XlsxPopulate: XlsxPopulateStatic
  export default XlsxPopulate
}
