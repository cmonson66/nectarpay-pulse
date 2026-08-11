export default function Landing() {
  return (
    <main className="wrap">
      <section className="hero">
        <p className="eyebrow">NectarPay · Arizona</p>
        <h1 className="display">
          Card fees take 3%.<br />This lane takes zero.
        </h1>
        <p className="sub">
          NectarPay is a terminal by your register that lets your shop accept crypto payments
          with no processing fee - money settles to your own wallet the second the
          customer pays. Your card reader keeps doing its job; this is the no-fee lane
          beside it.
        </p>
      </section>

      <div className="landingClaims">
        <div className="card claim">
          <h2 className="claimTitle">Zero processing on crypto</h2>
          <p className="claimBody">
            $499 for the terminal, $19 a month, flat. No percentage of your sales - ever.
          </p>
        </div>
        <div className="card claim">
          <h2 className="claimTitle">Your wallet, not a processor&rsquo;s account</h2>
          <p className="claimBody">
            Non-custodial: funds move straight from the customer to you, in seconds.
            Nobody can hold it, freeze it, or reverse it.
          </p>
        </div>
        <div className="card claim">
          <h2 className="claimTitle">No chargebacks</h2>
          <p className="claimBody">
            A delivered sale stays sold. Crypto payments are final - the dispute-fee
            lottery ends here.
          </p>
        </div>
      </div>

      <footer className="foot">
        <span className="footBrand">
          Nectar<span className="footAccent">Pay</span> · Arizona
        </span>
        <span>Independent NectarPay Ambassadors · Phoenix, AZ</span>
      </footer>
    </main>
  );
}
