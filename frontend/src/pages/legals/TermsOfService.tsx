import { useNavigate } from "react-router-dom";

export default function TermsOfService() {
  const navigate = useNavigate();

  function navigateToContactPage() {
    navigate("/contact");
  }

  return (
    <div className='main-content'>
      <h1>Terms of Service</h1>

      <p>
        <strong>Last Updated:</strong> March 25, 2025
      </p>

      <p>
        Welcome to Summarizz (hereinafter referred to as "the App"), accessible
        at https://summarizz.app/. By accessing or using the App, you
        (hereinafter referred to as "the User") agree to comply with and be
        bound by the following Terms of Service ("Terms"). If you do not agree
        with these Terms, please do not use the App.
      </p>

      <h2>1. Acceptance of Terms</h2>

      <p>
        By creating an account, uploading images, or subscribing to Pro features
        on Summarizz, you acknowledge that you have read, understood, and agreed
        to these Terms.
      </p>

      <h2>2. User Accounts</h2>

      <p>
        Users may create accounts to utilize the App's features. You are
        responsible for maintaining the confidentiality of your account
        credentials and for all activities that occur under your account. You
        agree to notify us immediately of any unauthorized access or use of your
        account.
      </p>

      <h2>3. User Content</h2>

      <p>
        Users may upload images to the App. By uploading images, you grant
        Summarizz a non-exclusive, royalty-free, worldwide license to use,
        reproduce, modify, and display the images for the purpose of providing
        and improving the App's services. You warrant that you have the
        necessary rights and permissions to upload and use the images.
      </p>

      <h2>4. Pro Subscription</h2>

      <p>
        Users may subscribe to Pro features for enhanced functionality.
        Subscription fees are processed through Stripe, a third-party payment
        processor. You agree to Stripe's terms of service and privacy policy.
        Summarizz is not responsible for any issues related to payment
        processing by Stripe.
      </p>

      <h2>5. Intellectual Property</h2>

      <p>
        The App and its content, including but not limited to software, code,
        and design, are owned by us (Summarizz). You may not reproduce,
        distribute, or modify any part of the App without our express written
        consent.
      </p>

      <h2>6. Third-Party Services</h2>

      <p>
        Summarizz utilizes third-party services, including but not limited to
        Stripe (payment processing), AdSense (advertising), Algolia (search),
        and hosting platforms. You agree to abide by the terms of service and
        privacy policies of these third-party services. Summarizz is not
        responsible for the performance or availability of these services.
      </p>

      <h2>7. Feedback and Improvements</h2>

      <p>
        We may use user feedback and suggestions to improve the App without
        providing compensation or credit to the users who provided the feedback.
        By providing feedback, you grant us a non-exclusive, perpetual,
        irrevocable, royalty-free, worldwide license to use and incorporate such
        feedback into the App.
      </p>

      <h2>8. Promotions</h2>

      <p>
        Summarizz may offer promotions and discounts from time to time. We
        reserve the right to modify or terminate any promotion at any time
        without notice.
      </p>

      <h2>9. Limitation of Liability</h2>

      <p>
        Summarizz is provided "as is" and "as available" without any warranties.
        We are not liable for any direct, indirect, incidental, consequential,
        or punitive damages arising from your use of the App. As we are students
        and this is a hobby project, there is no formal business entity.
        Therefore, no legal entity will be held liable.
      </p>

      <h2>10. Governing Law</h2>

      <p>
        These Terms shall be governed by and construed in accordance with the
        laws of the Province of Ontario, Canada, without regard to its conflict
        of law principles.
      </p>

      <h2>11. Changes to Terms</h2>

      <p>
        We reserve the right to modify these Terms at any time. Any changes will
        be posted on this page, and your continued use of the App constitutes
        acceptance of the revised Terms.
      </p>

      <h2>12. Contact Us</h2>

      <p>
        If you have any questions about these Terms, please contact us at:{" "}
        <a onClick={navigateToContactPage}>https://summarizz.app/contact</a>
      </p>
    </div>
  );
}
