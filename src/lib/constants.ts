export const VENUE_ADDRESS = '旺角新填地街576號新輝商業中心3樓A室'

export const WELCOME_MESSAGE =
  '歡迎來到 The Nest 🪺\n期待與您共度美好時光，祝您活動順利、歡聚愉快！'

export const SITE_NAME = 'The Nest'

export const HERO_LINES = [
  '歡迎回家，這裡是 The Nest 🪺',
  '聚在一起，每一刻都值得記住',
  '您的專屬聚腳點，由今日開始',
]

export const COPY_CONFIRMATION_TEMPLATE = (
  date: string,
  times: string,
  eventName: string
) =>
  `📅 ${date}\n⏰ ${times}\n🎉 ${eventName}\n📍 ${VENUE_ADDRESS}`
