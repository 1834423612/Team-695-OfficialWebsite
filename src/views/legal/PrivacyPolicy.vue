<template>
    <div class="legal-page">
        <main class="content">
            <div class="container">
                <h2 class="page-title">Privacy Policy</h2>

                <div class="policy-section">
                    <h3>Introduction</h3>
                    <p>This Privacy Policy describes how we collect, use, disclose, and protect your information when
                        you use our application Robotics Control WebAPP. By using our application, you consent to the
                        collection, use, and disclosure of your information as described in this Privacy Policy.</p>
                </div>

                <div class="policy-section">
                    <h3>Collection of Information</h3>
                    <p>We may collect the following types of information:</p>
                    <ul>
                        <li><strong>Personal Information:</strong> This includes information that can be used to
                            identify you, such as your name, email address, and phone number.</li>
                        <li><strong>Usage Information:</strong> This includes information about how you use our
                            application, such as the features you use, the pages you visit, and the actions you perform.
                        </li>
                    </ul>
                </div>

                <div class="policy-section">
                    <h3>Use of Information</h3>
                    <p>We use the information we collect to:</p>
                    <ul>
                        <li>Provide and improve our application.</li>
                        <li>Communicate with you about your use of our application.</li>
                        <li>Personalize your experience with our application.</li>
                        <li>Protect the security and integrity of our application.</li>
                    </ul>
                </div>

                <div class="policy-section">
                    <h3>Disclosure of Information</h3>
                    <p>We may disclose your information to:</p>
                    <ul>
                        <li>Service providers who help us operate our application.</li>
                        <li>Law enforcement or other government officials if required by law.</li>
                        <li>Other third parties with your consent.</li>
                    </ul>
                </div>

                <div class="policy-section">
                    <h3>Protection of Information</h3>
                    <p>We take reasonable measures to protect your information from unauthorized access, use, or
                        disclosure. However, no method of transmission over the internet or method of electronic storage
                        is 100% secure.</p>
                </div>

                <div class="policy-section">
                    <h3>Changes to This Privacy Policy</h3>
                    <p>We may update this Privacy Policy from time to time. If we make significant changes, we will
                        notify you by email or through our application.</p>
                </div>

                <div class="policy-section">
                    <h3>Contact Us</h3>
                    <p>If you have any questions about this Privacy Policy, please <a
                            href="https://www.team695.com/contact/" class="contact-link">contact us</a>.</p>
                </div>
            </div>
        </main>
<!-- 
        <footer class="footer">
            <div class="container">
                <p>&copy; {{ new Date().getFullYear() }} Team 695 Bison Robotics. All rights reserved.</p>
                <div class="footer-links">
                    <a href="#" class="footer-link">Privacy Policy</a>
                    <a href="#" class="footer-link">Terms of Service</a>
                    <a href="https://www.team695.com/contact/" class="footer-link">Contact</a>
                </div>
            </div>
        </footer> -->
    </div>
</template>

<style scoped>
.legal-page {
    font-family: 'Inter', 'Roboto', sans-serif;
    color: #333;
    line-height: 1.6;
    background-color: #f9f9f9;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}

.content {
    flex: 1;
    padding: 2rem 0;
}

.container {
    max-width: 800px;
    margin: 0 auto;
    padding: 0 1.5rem;
}

.page-title {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 2rem;
    color: #222;
    border-bottom: 2px solid #ffcc00;
    padding-bottom: 0.5rem;
}

.policy-section {
    margin-bottom: 2rem;
}

.policy-section h3 {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: #222;
}

.policy-section p,
.policy-section li {
    margin-bottom: 1rem;
    font-size: 1rem;
}

.policy-section ul {
    padding-left: 1.5rem;
    margin-bottom: 1rem;
}

.contact-link {
    color: #0066cc;
    text-decoration: none;
    font-weight: 500;
}

.contact-link:hover {
    text-decoration: underline;
}

.footer {
    background-color: #333;
    color: #fff;
    padding: 1.5rem 0;
    margin-top: 2rem;
}

.footer .container {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.footer p {
    margin: 0;
    font-size: 0.875rem;
}

.footer-links {
    display: flex;
    gap: 1.5rem;
}

.footer-link {
    color: #fff;
    text-decoration: none;
    font-size: 0.875rem;
}

.footer-link:hover {
    text-decoration: underline;
}

@media (max-width: 768px) {
    .header {
        flex-direction: column;
        padding: 1rem;
        gap: 1rem;
    }

    .navigation {
        width: 100%;
        justify-content: space-between;
    }

    .footer .container {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
    }
}
</style>