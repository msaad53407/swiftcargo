export function formatTimestampToTime(timestamp: string) {
  const date = new Date(timestamp);

  let hours = date.getHours();
  const minutes = date.getMinutes();

  const ampm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12;
  hours = hours ? hours : 12;

  const formattedMinutes = minutes < 10 ? "0" + minutes : minutes;

  const formattedTime = `${hours}:${formattedMinutes} ${ampm}`;

  return formattedTime;
}
