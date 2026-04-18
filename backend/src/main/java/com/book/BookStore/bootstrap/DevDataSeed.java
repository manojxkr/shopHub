package com.book.BookStore.bootstrap;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.lang.NonNull;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.book.BookStore.Repo.BookRepo;
import com.book.BookStore.Repo.UserRepo;
import com.book.BookStore.entity.Book;
import com.book.BookStore.entity.Role;
import com.book.BookStore.entity.User;

/**
 * Seeds demo users and books when the {@code dev} MySQL database has no users
 * yet (first run).
 * Disabled for {@code prod} profile.
 */
@Component
@Profile("dev")
public class DevDataSeed implements ApplicationRunner {

    private final UserRepo userRepo;
    private final BookRepo bookRepo;
    private final PasswordEncoder passwordEncoder;

    public DevDataSeed(UserRepo userRepo, BookRepo bookRepo, PasswordEncoder passwordEncoder) {
        this.userRepo = userRepo;
        this.bookRepo = bookRepo;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(ApplicationArguments args) {
        seedUsersIfEmpty();
        seedBooksIfMissing();
    }

    private void seedUsersIfEmpty() {
        if (userRepo.count() > 0) {
            return;
        }
        User admin = new User();
        admin.setName("Demo Admin");
        admin.setEmail("admin@bookstore.demo");
        admin.setPassword(passwordEncoder.encode("DemoAdmin1!"));
        admin.setRole(Role.ADMIN);
        userRepo.save(admin);

        User user = new User();
        user.setName("Demo User");
        user.setEmail("user@bookstore.demo");
        user.setPassword(passwordEncoder.encode("DemoUser1!"));
        user.setRole(Role.USER);
        userRepo.save(user);
    }

    private void seedBooksIfMissing() {
        seedBookIfMissing(sampleBook(
                "Clean Code",
                "Robert C. Martin",
                "Programming",
                "9780132350884",
                42.0,
                25,
                "Principles and practices for maintaining clear, maintainable software code.",
                "https://via.placeholder.com/300x400?text=Clean+Code"));
        seedBookIfMissing(sampleBook(
                "Design Patterns",
                "Gang of Four",
                "Programming",
                "9780201633612",
                54.99,
                18,
                "Essential object-oriented design patterns for professional developers.",
                "https://via.placeholder.com/300x400?text=Design+Patterns"));
        seedBookIfMissing(sampleBook(
                "The Pragmatic Programmer",
                "David Thomas, Andrew Hunt",
                "Programming",
                "9780135957059",
                49.99,
                22,
                "Comprehensive guide to career development and programming craftsmanship.",
                "https://via.placeholder.com/300x400?text=Pragmatic+Programmer"));
        seedBookIfMissing(sampleBook(
                "Java Concurrency in Practice",
                "Brian Goetz",
                "Programming",
                "9780321349606",
                59.99,
                15,
                "Master thread safety, locking, and concurrent programming in Java.",
                "https://via.placeholder.com/300x400?text=Java+Concurrency"));
        seedBookIfMissing(sampleBook(
                "Refactoring",
                "Martin Fowler",
                "Programming",
                "9780134757599",
                52.0,
                20,
                "Improving the design of existing code with proven techniques.",
                "https://via.placeholder.com/300x400?text=Refactoring"));
        seedBookIfMissing(sampleBook(
                "Code Complete",
                "Steve McConnell",
                "Programming",
                "9780735619678",
                61.99,
                17,
                "A practical handbook of software construction.",
                "https://via.placeholder.com/300x400?text=Code+Complete"));

        // TECHNOLOGY CATEGORY
        seedBookIfMissing(sampleBook(
                "The Innovators",
                "Walter Isaacson",
                "Technology",
                "9781476708690",
                28.99,
                30,
                "How a group of hackers, geniuses, and geeks created the digital revolution.",
                "https://via.placeholder.com/300x400?text=The+Innovators"));
        seedBookIfMissing(sampleBook(
                "Artificial Intelligence Basics",
                "Tom Taulli",
                "Technology",
                "9781491941820",
                31.99,
                25,
                "A beginner's guide to AI, machine learning, and cognitive computing.",
                "https://via.placeholder.com/300x400?text=AI+Basics"));
        seedBookIfMissing(sampleBook(
                "The Art of Computer Programming",
                "Donald E. Knuth",
                "Technology",
                "9780201896831",
                99.99,
                8,
                "The definitive computer science reference for algorithms.",
                "https://via.placeholder.com/300x400?text=Computer+Programming"));
        seedBookIfMissing(sampleBook(
                "Introduction to Algorithms",
                "Cormen, Leiserson, Rivest",
                "Technology",
                "9780262033848",
                79.99,
                12,
                "Algorithm design, analysis, and implementation guide.",
                "https://via.placeholder.com/300x400?text=Algorithms"));

        // WEB DEVELOPMENT CATEGORY
        seedBookIfMissing(sampleBook(
                "Learning React",
                "Alex Banks, Eve Porcello",
                "Web Development",
                "9781492051732",
                35.99,
                28,
                "Get started with React, hooks, and modern web development.",
                "https://via.placeholder.com/300x400?text=Learning+React"));
        seedBookIfMissing(sampleBook(
                "JavaScript: The Good Parts",
                "Douglas Crockford",
                "Web Development",
                "9780596517748",
                29.99,
                22,
                "Master the essential parts of JavaScript programming.",
                "https://via.placeholder.com/300x400?text=JavaScript+Good+Parts"));
        seedBookIfMissing(sampleBook(
                "You Don't Know JS",
                "Kyle Simpson",
                "Web Development",
                "9781491927281",
                24.99,
                26,
                "Deep dive into JavaScript scope, closures, and asynchronous programming.",
                "https://via.placeholder.com/300x400?text=You+Dont+Know+JS"));
        seedBookIfMissing(sampleBook(
                "Eloquent JavaScript",
                "Marijn Haverbeke",
                "Web Development",
                "9781593279509",
                39.99,
                19,
                "A modern introduction to programming with JavaScript.",
                "https://via.placeholder.com/300x400?text=Eloquent+JavaScript"));

        // DATABASE CATEGORY
        seedBookIfMissing(sampleBook(
                "Database Design Manual",
                "Lightstone, Teorey, Nadeau",
                "Database",
                "9781491918662",
                45.99,
                16,
                "Practical principles and best practices for database design.",
                "https://via.placeholder.com/300x400?text=Database+Design"));
        seedBookIfMissing(sampleBook(
                "SQL Performance Explained",
                "Markus Winand",
                "Database",
                "9783950307825",
                34.99,
                21,
                "Understanding how SQL executes and optimizing query performance.",
                "https://via.placeholder.com/300x400?text=SQL+Performance"));
        seedBookIfMissing(sampleBook(
                "NoSQL Distilled",
                "Fowler, Sadalage",
                "Database",
                "9780321826626",
                32.99,
                19,
                "A brief guide to the emerging world of polyglot persistence.",
                "https://via.placeholder.com/300x400?text=NoSQL+Distilled"));

        // CLOUD & DevOps CATEGORY
        seedBookIfMissing(sampleBook(
                "The Phoenix Project",
                "Gene Kim, Kevin Behr, George Spafford",
                "Cloud & DevOps",
                "9780988927912",
                39.99,
                24,
                "A novel about IT, DevOps, and tackling the constraints.",
                "https://via.placeholder.com/300x400?text=Phoenix+Project"));
        seedBookIfMissing(sampleBook(
                "Site Reliability Engineering",
                "Beyer, Jones, Petoff, Murphy",
                "Cloud & DevOps",
                "9781491929881",
                69.99,
                11,
                "How Google runs production systems reliably at scale.",
                "https://via.placeholder.com/300x400?text=SRE+Book"));
        seedBookIfMissing(sampleBook(
                "Docker in Action",
                "Jeff Nickoloff",
                "Cloud & DevOps",
                "9781617296871",
                44.99,
                20,
                "Comprehensive guide to containerization and Docker.",
                "https://via.placeholder.com/300x400?text=Docker+Action"));

        // SECURITY CATEGORY
        seedBookIfMissing(sampleBook(
                "The Web Application Hacker's Handbook",
                "Stuttard, Pinto",
                "Security",
                "9781118026472",
                65.99,
                14,
                "Complete guide to web application security testing.",
                "https://via.placeholder.com/300x400?text=Web+App+Security"));
        seedBookIfMissing(sampleBook(
                "Applied Cryptography",
                "Bruce Schneier",
                "Security",
                "9780471117099",
                89.99,
                9,
                "Protocols, algorithms, and source code for security.",
                "https://via.placeholder.com/300x400?text=Applied+Crypto"));

        // CAREER & SELF-HELP CATEGORY
        seedBookIfMissing(sampleBook(
                "The Mythical Man-Month",
                "Fred Brooks",
                "Career",
                "9780201835953",
                49.99,
                18,
                "Essential essays on software project management.",
                "https://via.placeholder.com/300x400?text=Mythical+Man+Month"));
        seedBookIfMissing(sampleBook(
                "Cracking the Coding Interview",
                "Gayle Laakmann McDowell",
                "Career",
                "9780984782857",
                44.99,
                32,
                "189 programming questions and solutions for job interviews.",
                "https://via.placeholder.com/300x400?text=Coding+Interview"));
        seedBookIfMissing(sampleBook(
                "System Design Interview",
                "Alex Xu, Shuyi Xie",
                "Career",
                "9781736049679",
                49.99,
                28,
                "An insider's guide to prepare for system design interviews.",
                "https://via.placeholder.com/300x400?text=System+Design"));

        // SCIENCE & AI CATEGORY
        seedBookIfMissing(sampleBook(
                "Life 3.0",
                "Max Tegmark",
                "Science",
                "9780394535424",
                32.99,
                23,
                "Being human in the age of artificial intelligence.",
                "https://via.placeholder.com/300x400?text=Life+3.0"));
        seedBookIfMissing(sampleBook(
                "A Brief History of Time",
                "Stephen Hawking",
                "Science",
                "9780553380163",
                18.99,
                35,
                "From the Big Bang to Black Holes.",
                "https://via.placeholder.com/300x400?text=Brief+History+Time"));

        // BUSINESS & ENTREPRENEURSHIP CATEGORY
        seedBookIfMissing(sampleBook(
                "The Lean Startup",
                "Eric Ries",
                "Business",
                "9780307887894",
                29.99,
                29,
                "How today's entrepreneurs build successful businesses.",
                "https://via.placeholder.com/300x400?text=Lean+Startup"));
        seedBookIfMissing(sampleBook(
                "Good to Great",
                "Jim Collins",
                "Business",
                "9780066620992",
                32.99,
                26,
                "Why some companies make the leap and others don't.",
                "https://via.placeholder.com/300x400?text=Good+to+Great"));

        // HISTORY & CULTURE CATEGORY
        seedBookIfMissing(sampleBook(
                "Sapiens",
                "Yuval Noah Harari",
                "History",
                "9780062316097",
                22.5,
                40,
                "A brief history of humankind from the Stone Age to modern times.",
                "https://via.placeholder.com/300x400?text=Sapiens"));
        seedBookIfMissing(sampleBook(
                "Homo Deus",
                "Yuval Noah Harari",
                "History",
                "9780062541529",
                28.99,
                25,
                "A brief history of tomorrow.",
                "https://via.placeholder.com/300x400?text=Homo+Deus"));

        // FICTION & CLASSICS CATEGORY
        seedBookIfMissing(sampleBook(
                "1984",
                "George Orwell",
                "Fiction",
                "9780451524935",
                15.99,
                45,
                "A dystopian masterpiece about totalitarianism.",
                "https://via.placeholder.com/300x400?text=1984"));
        seedBookIfMissing(sampleBook(
                "The Great Gatsby",
                "F. Scott Fitzgerald",
                "Fiction",
                "9780743273565",
                12.99,
                38,
                "A tale of wealth, love, and the American Dream.",
                "https://via.placeholder.com/300x400?text=Great+Gatsby"));

        // PERSONAL DEVELOPMENT CATEGORY
        seedBookIfMissing(sampleBook(
                "Atomic Habits",
                "James Clear",
                "Personal Development",
                "9780735211292",
                27.0,
                35,
                "Tiny changes, remarkable results through habit formation.",
                "https://via.placeholder.com/300x400?text=Atomic+Habits"));
        seedBookIfMissing(sampleBook(
                "Mindset",
                "Carol S. Dweck",
                "Personal Development",
                "9780345472328",
                18.99,
                31,
                "The new psychology of success through growth mindset.",
                "https://via.placeholder.com/300x400?text=Mindset"));

        // FASHIONS CATEGORY
        seedBookIfMissing(sampleBook(
                "Minimalist Wardrobe",
                "Sophie Turner",
                "Fashions",
                "9781735000010",
                21.99,
                32,
                "Lightweight styling tips for versatile everyday fashion.",
                "https://via.placeholder.com/300x400?text=Minimalist+Wardrobe"));
        seedBookIfMissing(sampleBook(
                "Street Style Essentials",
                "Jordan Blake",
                "Fashions",
                "9781735000027",
                24.99,
                25,
                "Express your personality through modern streetwear looks.",
                "https://via.placeholder.com/300x400?text=Street+Style"));

        // BOOKS CATEGORY
        seedBookIfMissing(sampleBook(
                "The Ultimate Reading List",
                "Lena Harper",
                "Books",
                "9781735000034",
                18.99,
                40,
                "A curated collection of must-read titles across genres.",
                "https://via.placeholder.com/300x400?text=Reading+List"));
        seedBookIfMissing(sampleBook(
                "Collector's Edition Classics",
                "Martin Ellis",
                "Books",
                "9781735000041",
                34.99,
                22,
                "Beautiful hardcover editions of beloved classic stories.",
                "https://via.placeholder.com/300x400?text=Classic+Books"));

        // MOBILES CATEGORY
        seedBookIfMissing(sampleBook(
                "Pocket Power Smartphone",
                "TechNova",
                "Mobiles",
                "9781735000058",
                499.99,
                28,
                "A sleek, fast phone with premium camera and battery life.",
                "https://via.placeholder.com/300x400?text=Smartphone"));
        seedBookIfMissing(sampleBook(
                "Midnight Pro Mobile",
                "LinkOne",
                "Mobiles",
                "9781735000065",
                599.99,
                20,
                "Powerful performance and modern design for everyday use.",
                "https://via.placeholder.com/300x400?text=Mobile+Phone"));

        // ELECTRONICS CATEGORY
        seedBookIfMissing(sampleBook(
                "Travel Bluetooth Speaker",
                "SoundArc",
                "Electronics",
                "9781735000072",
                79.99,
                18,
                "Portable speaker with rich audio, long battery, and wireless pairing.",
                "https://via.placeholder.com/300x400?text=Bluetooth+Speaker"));
        seedBookIfMissing(sampleBook(
                "Smart Home Light Kit",
                "BrightHome",
                "Electronics",
                "9781735000089",
                64.99,
                26,
                "Control lighting with your phone or voice assistant.",
                "https://via.placeholder.com/300x400?text=Smart+Lights"));

        // SPORTS CATEGORY
        seedBookIfMissing(sampleBook(
                "Fitness Tracker Pro",
                "PulseX",
                "Sports",
                "9781735000096",
                89.99,
                30,
                "Track workouts, heart rate, and daily activity with ease.",
                "https://via.placeholder.com/300x400?text=Fitness+Tracker"));
        seedBookIfMissing(sampleBook(
                "Yoga & Recovery Kit",
                "WellFlex",
                "Sports",
                "9781735000102",
                49.99,
                35,
                "Everything you need for stretching, yoga, and muscle recovery.",
                "https://via.placeholder.com/300x400?text=Yoga+Kit"));

        // TOYS CATEGORY
        seedBookIfMissing(sampleBook(
                "STEM Building Blocks",
                "PlayLab",
                "Toys",
                "9781735000119",
                39.99,
                42,
                "Creative construction toy set for kids to build and learn.",
                "https://via.placeholder.com/300x400?text=Building+Blocks"));
        seedBookIfMissing(sampleBook(
                "Interactive Plush Robot",
                "KidTech",
                "Toys",
                "9781735000126",
                29.99,
                29,
                "Smart plush toy with lights, sounds, and playful learning games.",
                "https://via.placeholder.com/300x400?text=Plush+Robot"));
    }

    private void seedBookIfMissing(@NonNull Book book) {
        boolean exists = bookRepo.findByTitleContainingIgnoreCase(book.getTitle()).stream()
                .anyMatch(found -> found.getTitle().equalsIgnoreCase(book.getTitle()));
        if (!exists) {
            bookRepo.save(book);
        }
    }

    private static @NonNull Book sampleBook(String title, String authors, String genre, String isbn, double price,
            int stock, String description, String imageUrl) {
        Book b = new Book();
        b.setTitle(title);
        b.setAuthors(authors);
        b.setGenre(genre);
        b.setIsbn(isbn);
        b.setPrice(price);
        b.setStock(stock);
        b.setDescription(description);
        b.setImageUrl(imageUrl);
        return b;
    }
}
