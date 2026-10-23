import "../src/styles.css";
export const metadata = { title: "Learning OS — Your path to Java backend", description: "A practical skill tree for Java, Data Science and AGH. One connected learning journey." };
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="en"><body>{children}</body></html>; }
