import React, { useState } from 'react';
import { Card } from './Card';
import { Badge } from './Badge';
import './HighYieldReferenceView.css';

export const HighYieldReferenceView: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'numerical' | 'verbal' | 'geninfo' | 'clerical'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const sections = [
    {
      id: 'numerical',
      category: 'Numerical Ability',
      icon: '📐',
      badge: 'Professional & Subpro',
      topics: [
        {
          title: 'Ratio & Proportion Rules',
          formulas: [
            { label: 'Direct Ratio', rule: 'a : b = c : d → a × d = b × c (Cross-multiplication)' },
            { label: 'Inverse Ratio', rule: 'a × x = b × y (Product remains constant)' },
            { label: 'Partitive Ratio', rule: 'Part A = (a / (a + b + c)) × Total Quantity' },
            { label: 'Mental Trick', rule: 'For 15%, find 10% (move decimal 1 place left) + 5% (half of 10%).' },
          ],
        },
        {
          title: 'Percentages, Interest & Profit/Loss',
          formulas: [
            { label: 'Base-Rate-Percentage', rule: 'Percentage = Base × Rate  |  Base = Percentage ÷ Rate  |  Rate = Percentage ÷ Base' },
            { label: 'Discount Formula', rule: 'Discount = Original Price × Rate  |  Sale Price = Original Price × (1 − Rate)' },
            { label: 'Simple Interest', rule: 'Interest = Principal × Rate × Time (in years)' },
            { label: 'Compound Interest', rule: 'A = P(1 + r/n)^(n × t)  |  Annual: A = P(1 + r)^t' },
            { label: 'Successive Discounts', rule: 'Net Discount Rate = d1 + d2 − (d1 × d2 / 100)' },
          ],
        },
        {
          title: 'Speed Solving Word Problems',
          formulas: [
            { label: 'Work Problem Formula', rule: '1/A + 1/B = 1/Total Time  |  Combined Time = (A × B) / (A + B)' },
            { label: 'Distance-Speed-Time', rule: 'Distance = Speed × Time  |  Average Speed = Total Distance ÷ Total Time' },
            { label: 'Equal Distance Average Speed', rule: 'Average Speed = 2ab / (a + b)  (where a & b are the two speeds)' },
            { label: 'Mixture Formula', rule: 'Conc 1 × Vol 1 + Conc 2 × Vol 2 = Conc Final × Vol Final' },
          ],
        },
      ],
    },
    {
      id: 'verbal',
      category: 'Verbal Ability',
      icon: '📖',
      badge: 'Professional & Subpro',
      topics: [
        {
          title: 'Subject-Verb Agreement Rules',
          formulas: [
            { label: 'EACH Rule', rule: '👋 Ate/Kuya Tip: "EACH = 1 PERSON". Singular pronouns (each, everyone, anybody) ALWAYS take singular verbs (is, has, was).' },
            { label: 'Neither...Nor Rule', rule: 'The verb agrees with the NEAREST subject to it. (e.g. Neither the teacher nor the students WERE present.)' },
            { label: 'Inverted Sentence Rule', rule: 'In "There is/are..." sentences, find the real subject AFTER the verb.' },
            { label: 'Collective Nouns', rule: 'Singular if acting as 1 unit (The committee decides); Plural if members act individually.' },
          ],
        },
        {
          title: 'Vocabulary & High-Yield Latin Roots',
          formulas: [
            { label: 'bene / mal', rule: 'bene = good (benefit, benevolent)  |  mal = bad/evil (malice, malevolent)' },
            { label: 'dict / spect', rule: 'dict = say/speak (contradict, dictate)  |  spect = look/observe (inspect, introspective)' },
            { label: 'ambi / auto', rule: 'ambi = both (ambivalent, ambidextrous)  |  auto = self (autonomous, autobiography)' },
          ],
        },
      ],
    },
    {
      id: 'geninfo',
      category: 'General Information & Philippine Law',
      icon: '🇵🇭',
      badge: 'Professional & Subpro',
      topics: [
        {
          title: '1987 Philippine Constitution & Bill of Rights',
          formulas: [
            { label: 'Preamble Key Term', rule: '"...imploring the aid of Almighty God, in order to build a just and humane society..."' },
            { label: 'Bill of Rights §1', rule: 'Due Process & Equal Protection of the laws.' },
            { label: 'Bill of Rights §2', rule: 'Right against unreasonable searches & seizures; Search warrant requirement.' },
            { label: 'Bill of Rights §4', rule: 'Freedom of Speech, Expression, Press, and Peaceable Assembly.' },
            { label: 'Bill of Rights §12', rule: 'Miranda Rights: Right to remain silent, right to competent independent counsel.' },
            { label: '3 Commissions', rule: '1. Civil Service Commission (CSC) | 2. Commission on Elections (COMELEC) | 3. Commission on Audit (COA)' },
          ],
        },
        {
          title: 'RA 6713: Code of Conduct for Public Officials',
          formulas: [
            { label: '8 Norms of Conduct', rule: '1. Commitment to public interest | 2. Professionalism | 3. Justness & sincerity | 4. Political neutrality | 5. Responsiveness to the public | 6. Nationalism & patriotism | 7. Commitment to democracy | 8. Simple living' },
            { label: 'SALN Filing Deadline', rule: 'Must be filed on or before APRIL 30 of every year (and within 30 days upon assumption/separation).' },
            { label: 'Response to Letters', rule: 'All public officials must reply to letters/requests within 15 WORKING DAYS upon receipt.' },
          ],
        },
      ],
    },
    {
      id: 'clerical',
      category: 'Clerical Operations & Filing Rules',
      icon: '📁',
      badge: 'Subprofessional Focus',
      topics: [
        {
          title: 'Alphabetizing & Name Indexing Rules',
          formulas: [
            { label: 'Rule 1: Individual Names', rule: 'Order = LAST NAME, FIRST NAME, MIDDLE NAME/INITIAL. (e.g. Santos, Juan A.)' },
            { label: 'Rule 2: Prefixes', rule: 'Prefixes (De, Del, Dela, Von, Mac, Mc) are treated as part of the last name. (e.g. Dela Cruz precedes Delos Santos).' },
            { label: 'Rule 3: Titles & Suffixes', rule: 'Junior/Senior/III/Dr./Atty. are placed AT THE END in parentheses and ignored unless names are identical.' },
            { label: 'Rule 4: Business Names', rule: 'Indexed exactly as written unless it contains an individual’s full name (e.g. "Juan Santos Bakery" ➔ Santos, Juan Bakery).' },
          ],
        },
      ],
    },
  ];

  const filteredSections = sections.filter(sec => {
    if (activeCategory !== 'all' && sec.id !== activeCategory) return false;
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      sec.category.toLowerCase().includes(term) ||
      sec.topics.some(t =>
        t.title.toLowerCase().includes(term) ||
        t.formulas.some(f => f.label.toLowerCase().includes(term) || f.rule.toLowerCase().includes(term))
      )
    );
  });

  return (
    <div className="high-yield-view-container">
      {/* Search & Category Filter Bar */}
      <div className="hy-filter-bar">
        <input
          type="text"
          placeholder="🔎 Search formulas, RA 6713, rules..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="hy-search-input"
        />
        <div className="hy-category-pills">
          <button
            className={`hy-pill ${activeCategory === 'all' ? 'active' : ''}`}
            onClick={() => setActiveCategory('all')}
          >
            All Subjects
          </button>
          <button
            className={`hy-pill ${activeCategory === 'numerical' ? 'active' : ''}`}
            onClick={() => setActiveCategory('numerical')}
          >
            📐 Numerical
          </button>
          <button
            className={`hy-pill ${activeCategory === 'verbal' ? 'active' : ''}`}
            onClick={() => setActiveCategory('verbal')}
          >
            📖 Verbal
          </button>
          <button
            className={`hy-pill ${activeCategory === 'geninfo' ? 'active' : ''}`}
            onClick={() => setActiveCategory('geninfo')}
          >
            🇵🇭 Gen Info & Laws
          </button>
          <button
            className={`hy-pill ${activeCategory === 'clerical' ? 'active' : ''}`}
            onClick={() => setActiveCategory('clerical')}
          >
            📁 Clerical
          </button>
        </div>
      </div>

      {/* Render High Yield Sections */}
      {filteredSections.map(sec => (
        <Card key={sec.id} className="hy-section-card">
          <div className="hy-section-header">
            <div className="hy-header-title-box">
              <span className="hy-sec-icon">{sec.icon}</span>
              <h3>{sec.category}</h3>
            </div>
            <Badge variant="teal">{sec.badge}</Badge>
          </div>

          <div className="hy-topics-grid">
            {sec.topics.map((t, idx) => (
              <div key={idx} className="hy-topic-card">
                <h4 className="hy-topic-title">{t.title}</h4>
                <div className="hy-formulas-list">
                  {t.formulas.map((f, fIdx) => (
                    <div key={fIdx} className="hy-formula-item">
                      <span className="hy-formula-label">{f.label}:</span>
                      <span className="hy-formula-rule">{f.rule}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
};
