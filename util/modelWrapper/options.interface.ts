/** pagination interface */
export class RequestOptions {
  /** limit */
  limit?: number;
  /** page */
  pageNumber?: number;
  /** props to select */
  select?: any;
  /** sort */
  sort?: string;
}
