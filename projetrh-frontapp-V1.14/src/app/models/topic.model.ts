export class Topic {

  constructor(
    public id: number,
    public label: string,
    public description: string,
    public createdAt: Date,
    public archived: boolean
  ) {
  }

}
