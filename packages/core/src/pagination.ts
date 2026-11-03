export type PaginationItem = number | {start: number; end: number};

export function normalizePaginationTotal(total: number): number {
  return Number.isFinite(total) ? Math.max(1, Math.min(Number.MAX_SAFE_INTEGER, Math.floor(total))) : 1;
}
export function normalizePaginationPage(page: number, total: number): number {
  return Number.isFinite(page) ? Math.max(1, Math.min(normalizePaginationTotal(total), Math.floor(page))) : 1;
}

/** Bounded page windows; gap ranges retain every omitted destination. */
export function getPaginationItems(page: number, totalPages: number, siblingCount = 1): PaginationItem[] {
  const total = normalizePaginationTotal(totalPages), current = normalizePaginationPage(page, total);
  const radius = Number.isFinite(siblingCount) ? Math.max(0, Math.min(5, Math.floor(siblingCount))) : 1;
  const edgeCount = radius * 2 + 3;
  const start = current <= radius + 2 ? 1 : current >= total - radius - 1 ? Math.max(1, total - edgeCount + 1) : current - radius;
  const end = current <= radius + 2 ? Math.min(total, edgeCount) : current >= total - radius - 1 ? total : current + radius;
  const pages = [...new Set([1, ...Array.from({length: end - start + 1}, (_, index) => start + index), total])].sort((a,b)=>a-b);
  return pages.flatMap<PaginationItem>((value,index)=>{
    const previous=pages[index-1];
    if(previous === undefined || value === previous+1) return [value];
    if(value === previous+2) return [previous+1,value];
    return [{start:previous+1,end:value-1},value];
  });
}
