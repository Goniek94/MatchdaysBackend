// Enums for auction/listing properties

export enum ItemType {
  JERSEY = "JERSEY",
  SCARF = "SCARF",
  BOOTS = "BOOTS",
  BALL = "BALL",
  MEMORABILIA = "MEMORABILIA",
  OTHER = "OTHER",
}

export enum ListingType {
  AUCTION = "AUCTION",
  BUY_NOW = "BUY_NOW",
  BOTH = "BOTH",
}

export enum AuctionCategory {
  PREMIER_LEAGUE = "PREMIER_LEAGUE",
  LA_LIGA = "LA_LIGA",
  BUNDESLIGA = "BUNDESLIGA",
  SERIE_A = "SERIE_A",
  LIGUE_1 = "LIGUE_1",
  CHAMPIONS_LEAGUE = "CHAMPIONS_LEAGUE",
  EUROPA_LEAGUE = "EUROPA_LEAGUE",
  WORLD_CUP = "WORLD_CUP",
  EURO = "EURO",
  NATIONAL_TEAMS = "NATIONAL_TEAMS",
  OTHER = "OTHER",
}

export enum JerseySize {
  XS = "XS",
  S = "S",
  M = "M",
  L = "L",
  XL = "XL",
  XXL = "XXL",
  XXXL = "XXXL",
}

export enum JerseyCondition {
  NEW_WITH_TAGS = "NEW_WITH_TAGS",
  NEW_WITHOUT_TAGS = "NEW_WITHOUT_TAGS",
  EXCELLENT = "EXCELLENT",
  VERY_GOOD = "VERY_GOOD",
  GOOD = "GOOD",
  FAIR = "FAIR",
  MATCH_WORN = "MATCH_WORN",
}

export enum AuctionStatus {
  DRAFT = "DRAFT",
  PENDING_APPROVAL = "PENDING_APPROVAL",
  ACTIVE = "ACTIVE",
  ENDED = "ENDED",
  SOLD = "SOLD",
  CANCELLED = "CANCELLED",
  REJECTED = "REJECTED",
}
