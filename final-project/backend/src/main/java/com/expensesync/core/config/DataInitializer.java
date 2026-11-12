package com.expensesync.core.config;

import com.expensesync.core.entity.Category;
import com.expensesync.core.entity.Expense;
import com.expensesync.core.entity.Group;
import com.expensesync.core.entity.User;
import com.expensesync.core.repository.CategoryRepository;
import com.expensesync.core.repository.ExpenseRepository;
import com.expensesync.core.repository.GroupRepository;
import com.expensesync.core.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;

@Configuration
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final GroupRepository groupRepository;
    private final ExpenseRepository expenseRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           CategoryRepository categoryRepository,
                           GroupRepository groupRepository,
                           ExpenseRepository expenseRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.groupRepository = groupRepository;
        this.expenseRepository = expenseRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) return; // Already seeded

        System.out.println("⚡ Seeding initial demo data for ExpenseSync Core Service...");

        // 1. Seed 4 Users
        String encodedPass = passwordEncoder.encode("Password@123");
        User rahul = userRepository.save(new User("Rahul Sharma", "rahul@example.com", encodedPass, "INR"));
        User priya = userRepository.save(new User("Priya Nair", "priya@example.com", encodedPass, "INR"));
        User amit = userRepository.save(new User("Amit Patel", "amit@example.com", encodedPass, "INR"));
        User sneha = userRepository.save(new User("Sneha Rao", "sneha@example.com", encodedPass, "INR"));

        // 2. Seed Categories
        List<Category> categories = Arrays.asList(
                new Category("FOOD", "🍔", true),
                new Category("TRAVEL", "✈️", true),
                new Category("RENT", "🏠", true),
                new Category("SHOPPING", "🛍️", true),
                new Category("BILLS", "💡", true),
                new Category("ENTERTAINMENT", "🎬", true),
                new Category("HEALTH", "💊", true),
                new Category("OTHER", "📁", true)
        );
        categoryRepository.saveAll(categories);
        Category food = categoryRepository.findByName("FOOD").orElse(categories.get(0));
        Category rent = categoryRepository.findByName("RENT").orElse(categories.get(2));
        Category travel = categoryRepository.findByName("TRAVEL").orElse(categories.get(1));
        Category bills = categoryRepository.findByName("BILLS").orElse(categories.get(4));

        // 3. Seed Groups
        Group goaTrip = new Group();
        goaTrip.setName("Goa Trip 2026");
        goaTrip.setType("TRIP");
        goaTrip.setCreatedBy(rahul);
        goaTrip.setMembers(new HashSet<>(Arrays.asList(rahul, priya, amit, sneha)));
        groupRepository.save(goaTrip);

        Group flatmates = new Group();
        flatmates.setName("Flatmates B-302");
        flatmates.setType("HOME");
        flatmates.setCreatedBy(rahul);
        flatmates.setMembers(new HashSet<>(Arrays.asList(rahul, amit, sneha)));
        groupRepository.save(flatmates);

        // 4. Seed Expenses
        createExpense("Monthly Flat Rent", new BigDecimal("9500.00"), rent, rahul, null, LocalDate.now().minusDays(10), "BANK", true);
        createExpense("Swiggy Team Lunch", new BigDecimal("1450.00"), food, rahul, goaTrip, LocalDate.now().minusDays(8), "UPI", false);
        createExpense("Uber Airport Drop", new BigDecimal("850.00"), travel, rahul, goaTrip, LocalDate.now().minusDays(6), "CARD", false);
        createExpense("Goa Beach Villa (2 Nights)", new BigDecimal("16000.00"), rent, priya, goaTrip, LocalDate.now().minusDays(5), "CARD", false);
        createExpense("Airtel Fiber Broadband", new BigDecimal("999.00"), bills, rahul, null, LocalDate.now().minusDays(2), "UPI", true);

        System.out.println("✓ ExpenseSync Core Database seeded successfully!");
    }

    private void createExpense(String title, BigDecimal amount, Category cat, User payer, Group group, LocalDate date, String mode, boolean recurring) {
        Expense exp = new Expense();
        exp.setTitle(title);
        exp.setAmount(amount);
        exp.setCategory(cat);
        exp.setPaidBy(payer);
        exp.setGroup(group);
        exp.setExpenseDate(date);
        exp.setPaymentMethod(mode);
        exp.setIsRecurring(recurring);
        expenseRepository.save(exp);
    }
}
