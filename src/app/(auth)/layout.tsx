export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Kita tidak menambahkan komponen <Header /> atau <Footer /> di sini.
    // Sehingga, halaman yang menggunakan layout ini akan tampil bersih.
    return (
        <div className="bg-gray-50">
            {children}
        </div>
    );
}